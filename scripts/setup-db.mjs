// Creates the database tables and adds some sample products.
// Run with:  npm run db:setup
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Did you create .env.local?");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false, max: 1 });

const products = [
  ["classic-tee", "Classic T-Shirt", "Soft 100% cotton tee for everyday wear.", 1999, "👕"],
  ["denim-jeans", "Denim Jeans", "Straight-fit jeans that go with everything.", 4999, "👖"],
  ["running-shoes", "Running Shoes", "Lightweight shoes built for comfort.", 7999, "👟"],
  ["baseball-cap", "Baseball Cap", "Adjustable cap to keep the sun away.", 1499, "🧢"],
  ["backpack", "Everyday Backpack", "Roomy backpack with a laptop sleeve.", 3999, "🎒"],
  ["sunglasses", "Sunglasses", "UV-protected shades with a classic look.", 2499, "🕶️"],
  ["wrist-watch", "Wrist Watch", "Minimal analog watch with leather strap.", 9999, "⌚"],
  ["coffee-mug", "Coffee Mug", "Ceramic mug that keeps your coffee happy.", 999, "☕"],
];

try {
  await sql`
    create table if not exists users (
      id serial primary key,
      email text unique not null,
      name text,
      image text,
      created_at timestamptz not null default now(),
      last_login_at timestamptz not null default now()
    )`;

  await sql`
    create table if not exists products (
      id serial primary key,
      slug text unique not null,
      name text not null,
      description text not null,
      price_cents integer not null check (price_cents >= 0),
      image text not null,
      created_at timestamptz not null default now()
    )`;

  await sql`
    create table if not exists orders (
      id serial primary key,
      user_id integer references users(id),
      email text not null,
      customer_name text not null,
      phone text not null,
      address text not null,
      city text not null,
      country text not null,
      total_cents integer not null,
      status text not null default 'pending',
      email_sent boolean not null default false,
      created_at timestamptz not null default now()
    )`;

  await sql`
    create table if not exists order_items (
      id serial primary key,
      order_id integer not null references orders(id) on delete cascade,
      product_id integer not null references products(id),
      product_name text not null,
      unit_price_cents integer not null,
      quantity integer not null check (quantity > 0)
    )`;

  // Server-side cart so the SAME cart shows on the website and the mobile app.
  await sql`
    create table if not exists carts (
      id serial primary key,
      user_id integer not null references users(id) on delete cascade,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(user_id)
    )`;

  await sql`
    create table if not exists cart_items (
      id serial primary key,
      cart_id integer not null references carts(id) on delete cascade,
      product_id integer not null references products(id) on delete cascade,
      quantity integer not null check (quantity > 0),
      unique(cart_id, product_id)
    )`;

  for (const [slug, name, description, price, image] of products) {
    await sql`
      insert into products (slug, name, description, price_cents, image)
      values (${slug}, ${name}, ${description}, ${price}, ${image})
      on conflict (slug) do update
        set name = excluded.name,
            description = excluded.description,
            price_cents = excluded.price_cents,
            image = excluded.image`;
  }

  console.log("✅ Database is ready! Tables created and sample products added.");
} catch (err) {
  console.error("❌ Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
