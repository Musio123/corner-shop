import postgres from "postgres";

// One shared database connection for the whole app.
// "prepare: false" makes it work with both Neon and Supabase's connection pooler.
const globalForDb = globalThis;

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Copy .env.example to .env.local and fill it in."
    );
  }
  return postgres(process.env.DATABASE_URL, {
    ssl: "require",
    prepare: false,
    max: 5,
  });
}

export function getDb() {
  if (!globalForDb._sql) {
    globalForDb._sql = createClient();
  }
  return globalForDb._sql;
}
