import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser, ensureUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

// Shared cart API. Works for BOTH the website (cookie) and the mobile app
// (Bearer JWT) via getCurrentUser. The cart lives in the database, so it is the
// SAME cart on every device for a signed-in user.

// Returns the user's cart with product details.
async function loadCart(sql, userId) {
  const rows = await sql`
    select ci.product_id as id,
           p.name,
           p.image,
           p.price_cents,
           ci.quantity
    from cart_items ci
    join carts c on c.id = ci.cart_id
    join products p on p.id = ci.product_id
    where c.user_id = ${userId}
    order by ci.id`;
  const total_cents = rows.reduce((s, r) => s + r.price_cents * r.quantity, 0);
  const count = rows.reduce((s, r) => s + r.quantity, 0);
  return { items: rows, total_cents, count };
}

async function getCartId(sql, userId) {
  const [row] = await sql`
    insert into carts (user_id) values (${userId})
    on conflict (user_id) do update set updated_at = now()
    returning id`;
  return row.id;
}

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const sql = getDb();
  try {
    const dbUser = await ensureUserId(user.email, user.name, user.image);
    const cart = await loadCart(sql, dbUser.id);
    return NextResponse.json(cart);
  } catch (err) {
    console.error("GET /api/cart failed:", err);
    return NextResponse.json({ error: "Could not load cart." }, { status: 500 });
  }
}

// Add / increment an item: { product_id, quantity }
export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = Number(body.product_id);
  const qty = Number(body.quantity ?? 1);
  if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1 || qty > 99) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const sql = getDb();
  try {
    const [product] = await sql`select id from products where id = ${productId}`;
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const dbUser = await ensureUserId(user.email, user.name, user.image);
    const cartId = await getCartId(sql, dbUser.id);

    await sql`
      insert into cart_items (cart_id, product_id, quantity)
      values (${cartId}, ${productId}, ${qty})
      on conflict (cart_id, product_id) do update
        set quantity = least(cart_items.quantity + excluded.quantity, 99)`;

    const cart = await loadCart(sql, dbUser.id);
    return NextResponse.json(cart, { status: 200 });
  } catch (err) {
    console.error("POST /api/cart failed:", err);
    return NextResponse.json({ error: "Could not update cart." }, { status: 500 });
  }
}

// Set an absolute quantity: { product_id, quantity }. quantity 0 removes it.
export async function PATCH(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = Number(body.product_id);
  const qty = Number(body.quantity);
  if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty < 0 || qty > 99) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const sql = getDb();
  try {
    const dbUser = await ensureUserId(user.email, user.name, user.image);
    const [cart] = await sql`select id from carts where user_id = ${dbUser.id}`;
    if (cart) {
      if (qty === 0) {
        await sql`delete from cart_items where cart_id = ${cart.id} and product_id = ${productId}`;
      } else {
        await sql`
          insert into cart_items (cart_id, product_id, quantity)
          values (${cart.id}, ${productId}, ${qty})
          on conflict (cart_id, product_id) do update set quantity = excluded.quantity`;
      }
    }
    const result = await loadCart(sql, dbUser.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("PATCH /api/cart failed:", err);
    return NextResponse.json({ error: "Could not update cart." }, { status: 500 });
  }
}

// Remove an item entirely: ?product_id=123
export async function DELETE(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const productId = Number(new URL(request.url).searchParams.get("product_id"));
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const sql = getDb();
  try {
    const dbUser = await ensureUserId(user.email, user.name, user.image);
    const [cart] = await sql`select id from carts where user_id = ${dbUser.id}`;
    if (cart) {
      await sql`delete from cart_items where cart_id = ${cart.id} and product_id = ${productId}`;
    }
    const result = await loadCart(sql, dbUser.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("DELETE /api/cart failed:", err);
    return NextResponse.json({ error: "Could not update cart." }, { status: 500 });
  }
}
