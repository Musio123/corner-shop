import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Resolves the currently signed-in user's email from EITHER:
//   - the website  -> NextAuth session cookie, or
//   - the mobile app -> "Authorization: Bearer <jwt>" header.
// Returns { email, name, image } or null if not signed in.
export async function getCurrentUser(request) {
  // 1) Mobile app: Bearer JWT (checked first so phone requests never depend
  //    on NextAuth's cookie handling).
  const header = request.headers.get("authorization") || request.headers.get("Authorization");
  if (header && header.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    try {
      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload } = await jwtVerify(token, secret);
      if (payload?.email) {
        return { email: payload.email, name: payload.name, image: payload.picture };
      }
    } catch {
      // invalid/expired token -> fall through
    }
  }

  // 2) Website: NextAuth cookie session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return { email: session.user.email, name: session.user.name, image: session.user.image };
    }
  } catch {
    // No/invalid cookie session -> not signed in via web either.
  }

  return null;
}

// Ensures the user exists in the DB and returns their row id.
export async function ensureUserId(email, name, image) {
  const sql = getDb();
  const [user] = await sql`
    insert into users (email, name, image)
    values (${email}, ${name ?? null}, ${image ?? null})
    on conflict (email) do update
      set name = excluded.name,
          image = excluded.image
    returning id, email, name, image`;
  return user;
}
