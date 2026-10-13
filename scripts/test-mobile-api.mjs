// End-to-end test of the mobile-facing API against the live Vercel deployment.
// Signs the JWT with the LOCAL NEXTAUTH_SECRET, which we've synced to match
// Vercel's, so it verifies in production exactly as the app's token will.
import { SignJWT } from "jose";
import { readFileSync } from "node:fs";

const BASE = "https://corner-shop-psi.vercel.app";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const secretLine = env.split(/\r?\n/).find((l) => l.startsWith("NEXTAUTH_SECRET="));
// Split on the FIRST '=' only (base64 secrets contain '='), then trim quotes/space.
const secretRaw = secretLine.slice(secretLine.indexOf("=") + 1).trim().replace(/^"+|"+$/g, "");
console.log("local secret length:", secretRaw.length);

const secret = new TextEncoder().encode(secretRaw);
const token = await new SignJWT({ email: "ajibademusty@gmail.com", name: "Mustapha" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(secret);

const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const p = await fetch(`${BASE}/api/products`);
const pj = await p.json();
console.log(`GET /api/products -> ${p.status}, ${pj.products?.length} products`);

const pid = pj.products[0].id;
let r = await fetch(`${BASE}/api/cart`, { method: "POST", headers: auth, body: JSON.stringify({ product_id: pid, quantity: 2 }) });
let c = await r.json();
console.log(`POST /api/cart (add ${pid} x2) -> ${r.status}, items=${c.items?.length}, total=${c.total_cents}`);

r = await fetch(`${BASE}/api/cart`, { headers: auth });
c = await r.json();
console.log(`GET /api/cart -> ${r.status}, count=${c.count}`);

r = await fetch(`${BASE}/api/cart`, { method: "PATCH", headers: auth, body: JSON.stringify({ product_id: pid, quantity: 0 }) });
c = await r.json();
console.log(`PATCH /api/cart (remove) -> ${r.status}, items=${c.items?.length}`);

r = await fetch(`${BASE}/api/cart`);
console.log(`GET /api/cart (no token) -> ${r.status} (expect 401)`);


