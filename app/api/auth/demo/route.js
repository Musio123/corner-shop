import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { ensureUserId } from "@/lib/session";

// DEMO-ONLY login: lets you sign in by typing an email, so the mobile app can be
// tested on a physical phone via Expo Go (which can't do Google OAuth redirects).
//
// SECURITY: this is gated behind ALLOW_DEMO_LOGIN=true. In production you would
// remove it (or never set the flag). It intentionally trusts the typed email and
// upserts that user, exactly like a real Google sign-in would.
export async function POST(request) {
  if (process.env.ALLOW_DEMO_LOGIN !== "true") {
    return NextResponse.json({ error: "Demo login is disabled." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  // Basic email sanity check.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : email.split("@")[0];

  try {
    await ensureUserId(email, name, null);
  } catch (err) {
    console.error("Demo login: could not save user:", err);
    return NextResponse.json({ error: "Could not save user." }, { status: 500 });
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({ token, user: { email, name, image: null } });
}
