// Local check: does jose verify a token signed with the SAME secret?
import { SignJWT, jwtVerify } from "jose";
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const secretLine = env.split(/\r?\n/).find((l) => l.startsWith("NEXTAUTH_SECRET="));
const raw = secretLine.split("=")[1].trim().replace(/^"|"$/g, "");
console.log("secret length:", raw.length);

const secret = new TextEncoder().encode(raw);
const token = await new SignJWT({ email: "test@example.com" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("1h")
  .sign(secret);

try {
  const { payload } = await jwtVerify(token, secret);
  console.log("LOCAL verify OK, email:", payload.email);
} catch (e) {
  console.log("LOCAL verify FAILED:", e.message);
}
console.log("token prefix:", token.slice(0, 20));
