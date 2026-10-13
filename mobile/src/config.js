// Central config. Reads values from app.json "extra" (see app.json).
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const API_URL = extra.apiUrl || "https://corner-shop-psi.vercel.app";

// The SAME Google OAuth client ID the website uses. Using the same ID means a
// user who signs in on the website can sign in here with the same account.
export const GOOGLE_CLIENT_ID = extra.googleClientId || "";
