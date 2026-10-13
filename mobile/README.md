# Corner Shop — Mobile App (Expo / React Native)

A mobile app for the Corner Shop. It talks to the **same API** as the website, so:

- You sign in with the **same Google account** you use on the website.
- Your cart is **shared**: an item added on the website appears in the app (and vice
  versa) within a few seconds.

The app is built with [Expo](https://expo.dev), so you can run it on a real phone in
minutes using the **Expo Go** app — no Android Studio / Xcode needed.

---

## 1. Install dependencies

```bash
cd mobile
npm install
```

## 2. Add your Google Client ID

Open `mobile/app.json` and replace the placeholder in `extra.googleClientId` with the
**same Google OAuth Client ID** the website uses (from Google Cloud Console):

```json
"extra": {
  "apiUrl": "https://corner-shop-psi.vercel.app",
  "googleClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
}
```

> The `apiUrl` already points at your live website API. Leave it as is unless your
> domain changes.

## 3. Start the app

```bash
npm start
```

A QR code appears in the terminal.

## 4. Open it on your physical phone

- **Android:** install **Expo Go** from the Play Store, open it, and scan the QR code.
- **iPhone:** install **Expo Go** from the App Store, open the Camera, and scan the QR code.

The app loads on your phone. Tap **Sign in with Google**.

---

## Important: Google sign-in setup

The app uses Google's OAuth flow through Expo's auth proxy, which needs the redirect
URI registered in Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials** → your OAuth client.
2. Under **Authorized redirect URIs**, add:
   ```
   https://auth.expo.io/@YOUR-EXPO-USERNAME/corner-shop-mobile
   ```
   (Your Expo username is shown when you run `npm start` / log in at expo.dev.)
3. Keep the existing website redirect URI too.

> Because Expo Go uses a proxy redirect, the `id_token` is verified server-side by
> `/api/auth/mobile`, which matches the user by email — so it's the **same account**
> as the website.

---

## How the sync works

- **Login:** the app signs in with Google, sends the Google ID token to
  `POST /api/auth/mobile`, and gets back a JWT it stores securely
  (`expo-secure-store`). That JWT is sent as `Authorization: Bearer …` on every call.
- **Cart:** lives in the database (tables `carts` / `cart_items`), keyed to your user.
  Both the website and the app read/write it and poll every ~4 seconds, so changes
  show up on the other device almost instantly.

---

## Files

```
App.js                     App entry + navigation
index.js                   Expo registration
app.json                   Expo config (API URL + Google client id)
babel.config.js            Babel/Expo preset
src/
  config.js                Reads API URL + Google client id
  api.js                   All API calls + token storage
  auth.js                  Auth context (sign in / out)
  cart.js                  Cart context (polls server for sync)
  format.js                Price formatting
  screens/
    LoginScreen.js         Google sign-in
    ProductsScreen.js      Product list + add to cart
    CartScreen.js          Shared cart + quantity controls
```
