// End-to-end test of the mobile-facing API against the live Vercel deployment.
// Mints a JWT (same secret the app login uses) and exercises products + cart.
import { SignJWT } from "jose";
import { readFileSync } from "node:fs";

const BASE = "https://corner-shop-psi.vercel.app";

// read secret from .env.local
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const secretLine = env.split(/\r?\n/).find((l) => l.startsWith("NEXTAUTH_SECRET="));
const secret = new TextEncoder().encode(secretLine.split("=")[1].trim().replace(/^"|"$/g, ""));

const token = await new SignJWT({ email: "ajibademusty@gmail.com", name: "Mustapha" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(secret);

const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

// 1) products
const p = await fetch(`${BASE}/api/products`);
const pj = await p.json();
console.log(`GET /api/products -> ${p.status}, ${pj.products?.length} products`);

// 2) add first product to cart
const pid = pj.products[0].id;
let r = await fetch(`${BASE}/api/cart`, { method: "POST", headers: auth, body: JSON.stringify({ product_id: pid, quantity: 2 }) });
let c = await r.json();
console.log(`POST /api/cart (add ${pid} x2) -> ${r.status}, items=${c.items?.length}, total=${c.total_cents}`);

// 3) read cart back (simulates the phone re-opening the app)
r = await fetch(`${BASE}/api/cart`, { headers: auth });
c = await r.json();
console.log(`GET /api/cart -> ${r.status}, count=${c.count}`);

// 4) set quantity to 0 (remove)
r = await fetch(`${BASE}/api/cart`, { method: "PATCH", headers: auth, body: JSON.stringify({ product_id: pid, quantity: 0 }) });
c = await r.json();
console.log(`PATCH /api/cart (remove) -> ${r.status}, items=${c.items?.length}`);

// 5) unauthorized check
r = await fetch(`${BASE}/api/cart`);
console.log(`GET /api/cart (no token) -> ${r.status} (expect 401)`);
