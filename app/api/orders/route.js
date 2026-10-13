import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/brevo";

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user?.email) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }
  const session = { user };

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const details = {
    customer_name: clean(body.customer_name, 100),
    phone: clean(body.phone, 30),
    address: clean(body.address, 200),
    city: clean(body.city, 100),
    country: clean(body.country, 100),
  };
  if (Object.values(details).some((v) => !v)) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }

  // Combine duplicate products and validate quantities.
  const quantities = new Map();
  for (const item of Array.isArray(body.items) ? body.items : []) {
    const id = Number(item?.product_id);
    const qty = Number(item?.quantity);
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
    }
    quantities.set(id, (quantities.get(id) ?? 0) + qty);
  }
  if (quantities.size === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const sql = getDb();

  try {
    // Prices always come from the database, never from the browser.
    const products = await sql`
      select id, name, price_cents from products where id in ${sql([...quantities.keys()])}`;
    if (products.length !== quantities.size) {
      return NextResponse.json(
        { error: "Some items in your cart no longer exist. Please refresh your cart." },
        { status: 400 }
      );
    }

    const items = products.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      unit_price_cents: p.price_cents,
      quantity: quantities.get(p.id),
    }));
    const total = items.reduce((sum, i) => sum + i.unit_price_cents * i.quantity, 0);

    // Save the order and its items together (all or nothing).
    const order = await sql.begin(async (tx) => {
      const [user] = await tx`select id from users where email = ${session.user.email}`;
      const [created] = await tx`
        insert into orders (user_id, email, customer_name, phone, address, city, country, total_cents)
        values (${user?.id ?? null}, ${session.user.email}, ${details.customer_name}, ${details.phone},
                ${details.address}, ${details.city}, ${details.country}, ${total})
        returning *`;
      for (const i of items) {
        await tx`
          insert into order_items (order_id, product_id, product_name, unit_price_cents, quantity)
          values (${created.id}, ${i.product_id}, ${i.product_name}, ${i.unit_price_cents}, ${i.quantity})`;
      }
      return created;
    });

    // Send the confirmation email. If it fails, the order still counts.
    let emailSent = false;
    try {
      await sendOrderConfirmation(order, items);
      emailSent = true;
      await sql`update orders set email_sent = true, status = 'confirmed' where id = ${order.id}`;
    } catch (err) {
      console.error("Confirmation email failed:", err.message);
    }

    return NextResponse.json({ orderId: order.id, emailSent }, { status: 201 });
  } catch (err) {
    console.error("Order failed:", err);
    return NextResponse.json({ error: "Could not place your order. Please try again." }, { status: 500 });
  }
}
