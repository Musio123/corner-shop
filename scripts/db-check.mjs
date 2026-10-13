// Quick diagnostic: connect to the database and report which tables exist.
// Run with:  node --env-file=.env scripts/db-check.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing. Create .env.local (or .env) and restart.");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", prepare: false, max: 1 });

try {
  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name`;
  const names = rows.map((r) => r.table_name);
  console.log("Tables found in 'public':", names.length ? names.join(", ") : "(none)");

  const required = ["users", "products", "orders", "order_items"];
  const missing = required.filter((t) => !names.includes(t));
  if (missing.length) {
    console.error("MISSING tables:", missing.join(", "));
    console.error("Fix: run  npm run db:setup");
    process.exitCode = 2;
  } else {
    console.log("All required tables exist. ✅");
  }
} catch (err) {
  console.error("Could not connect to the database:", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
