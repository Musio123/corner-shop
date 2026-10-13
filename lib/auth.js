import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    // Every time someone logs in with Google, save/update them in the database.
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        const sql = getDb();
        await sql`
          insert into users (email, name, image)
          values (${user.email}, ${user.name ?? null}, ${user.image ?? null})
          on conflict (email) do update
            set name = excluded.name,
                image = excluded.image,
                last_login_at = now()
        `;
        return true;
      } catch (err) {
        console.error("Could not save user to database:", err);
        return false;
      }
    },
  },
};
