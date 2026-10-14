# Corner Shop — Mobile App (Expo / React Native)

A mobile app for the Corner Shop. It talks to the **same API** as the website, so:

- You sign in with the **same account** (same email) you use on the website.
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

## 2. Start the app

```bash
npm start
```

A QR code appears in the terminal.

## 3. Open it on your physical phone

- **Android:** install **Expo Go** from the Play Store, open it, and scan the QR code.
- **iPhone:** install **Expo Go** from the App Store, open the Camera, and scan the QR code.

## 4. Log in

On the login screen, type the **same email you use on the website** and tap
**Continue**. That's it — you're in, using the same account and the same cart.

> There's also a "Sign in with Google" button, but full Google OAuth in Expo Go needs
> a development build (see "Real Google login" below). For testing on a phone quickly,
> the email login is the way to go.

---

## How the sync works

- **Login (demo/email):** the app sends your email to `POST /api/auth/demo`, which
  upserts the **same user** the website uses (matched by email) and returns a JWT the
  app stores securely (`expo-secure-store`). That JWT is sent as
  `Authorization: Bearer …` on every call.
  - This endpoint is gated behind `ALLOW_DEMO_LOGIN=true` (set on the server) so it's
    clearly a demo feature, not a production login method.
- **Cart:** lives in the database (tables `carts` / `cart_items`), keyed to your user.
  Both the website and the app read/write it and poll every ~4 seconds, so changes
  show up on the other device almost instantly.

---

## Testing on your phone (checklist)

1. `cd mobile && npm install && npm start`
2. Scan the QR with Expo Go on your phone.
3. Type your website email → **Continue**.
4. Open the **website** in a browser (signed in as the same email) and add an item.
5. Watch the app's **Cart** tab — the item appears within a few seconds. ✅
6. Add an item in the app, then look at the website cart — it appears there too. ✅

---

## Real Google login (optional, later)

Expo Go can't complete Google's OAuth redirect. To use the real "Sign in with Google"
button you need a **development build**:

1. Create a free Expo account at [expo.dev](https://expo.dev).
2. Add a custom scheme to `app.json` (already set to `cornershop`).
3. Build a development build: `npx expo run:android` (or `eas build --profile development`).
4. Register your app's redirect URI in Google Cloud Console.

Until then, the email login above is the reliable way to test on a phone.

---

## Files

```
App.js                     App entry + navigation
index.js                   Expo registration
app.json                   Expo config (API URL)
babel.config.js            Babel/Expo preset
src/
  config.js                Reads API URL
  api.js                   All API calls + token storage (Google + email login)
  auth.js                  Auth context (sign in / out / refresh)
  cart.js                  Cart context (polls server for sync)
  format.js                Price formatting
  screens/
    LoginScreen.js         Email login + Google sign-in
    ProductsScreen.js      Product list + add to cart
    CartScreen.js          Shared cart + quantity controls
```

