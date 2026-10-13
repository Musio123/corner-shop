import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public list of products (used by the mobile app; the website reads directly).
export async function GET() {
  try {
    const sql = getDb();
    const products = await sql`
      select id, slug, name, description, price_cents, image
      from products
      order by id`;
    return NextResponse.json({ products });
  } catch (err) {
    console.error("GET /api/products failed:", err);
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}
