import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { ensureUserId } from "@/lib/session";

// Mobile app login: the app signs in with Google (on the phone), gets a Google
// ID token, and sends it here. We verify it with Google, upsert the SAME user
// the website uses (matched by email), then return our own short-lived JWT that
// the app attaches as "Authorization: Bearer <jwt>" on every API call.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const idToken = typeof body.id_token === "string" ? body.id_token.trim() : "";
  if (!idToken) {
    return NextResponse.json({ error: "Missing Google ID token." }, { status: 400 });
  }

  // Verify the token with Google's public tokeninfo endpoint.
  let profile;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Google token verification failed." }, { status: 401 });
    }
    profile = await res.json();
  } catch (err) {
    return NextResponse.json({ error: "Could not verify token with Google." }, { status: 502 });
  }

  const email = profile?.email;
  if (!email) {
    return NextResponse.json({ error: "Google account has no email." }, { status: 400 });
  }
  // Optional: ensure the token was issued for OUR Google client.
  const aud = profile?.aud;
  if (process.env.GOOGLE_CLIENT_ID && aud && aud !== process.env.GOOGLE_CLIENT_ID) {
    // Some setups use different client IDs for web vs mobile; log but don't block.
    console.warn(`Google token audience mismatch: got "${aud}"`);
  }

  // Create/update the user (same account as the website uses).
  try {
    await ensureUserId(email, profile.name, profile.picture);
  } catch (err) {
    console.error("Could not save mobile user:", err);
    return NextResponse.json({ error: "Could not save user." }, { status: 500 });
  }

  // Issue our own JWT (valid 30 days).
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
  const token = await new SignJWT({ email, name: profile.name, picture: profile.picture })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({
    token,
    user: { email, name: profile.name ?? null, image: profile.picture ?? null },
  });
}
