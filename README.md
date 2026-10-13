# Corner Shop

A small e-commerce website built with **Next.js**. It has a product listing, a
cart, a checkout page, order history, **Google sign-in**, order persistence in a
**PostgreSQL** database (Neon or Supabase), and **confirmation emails** via
**Brevo**.

---

## What you need before you start

- [Node.js](https://nodejs.org) 18.17 or newer (you have v24 already).
- Free accounts for:
  - A database — [**Neon**](https://neon.tech) **or** [**Supabase**](https://supabase.com)
  - [**Google Cloud Console**](https://console.cloud.google.com) (for Google login)
  - [**Brevo**](https://www.brevo.com) (for confirmation emails)

Every secret goes in a file called `.env.local`, which is never committed to git.

---

## 1. Install dependencies

```bash
npm install
```

## 2. Create your database (Neon **or** Supabase — pick one)

Both are free Postgres databases. Either works; you only need one.

### Option A — Neon

1. Sign in at [neon.tech](https://neon.tech) and click **New Project**.
2. Give it a name, then open **Connection Details**.
3. Copy the connection string. It looks like:
   ```
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
   ```
4. Keep this string — it goes in `DATABASE_URL` below.

### Option B — Supabase

1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Go to **Project Settings → Database → Connection string**.
3. Choose the **Connection pooler** / **Transaction** tab and copy that string
   (it has port `6543` and contains `[YOUR-PASSWORD]`). Replace `[YOUR-PASSWORD]`
   with the database password you set when creating the project.
4. Keep this string — it goes in `DATABASE_URL`.

> The pooler string is used because it works reliably from serverless hosts. The
> app sets `prepare: false` for exactly this reason.

## 3. Set up Google sign-in (Google Cloud Console)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create
   a project (or pick an existing one).
2. Open **APIs & Services → OAuth consent screen**:
   - Choose **External** and fill in the app name and your email.
   - Under **Test users**, add the Google account(s) you'll sign in with (only
     needed while the app is in "Testing" mode).
3. Open **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Add an **Authorized redirect URI**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
     > For a deployed site, also add
     > `https://YOUR-DOMAIN/api/auth/callback/google`.
4. Click **Create**, then copy the **Client ID** and **Client secret**.

## 4. Set up confirmation emails (Brevo)

1. Sign up at [brevo.com](https://www.brevo.com) (the free tier includes 300 emails/day).
2. Go to **Senders, Domains & Dedicated IPs → Senders** and add a sender. Enter
   a name and an email you can access, then confirm it via the link Brevo emails
   you. This verified email becomes `BREVO_FROM_EMAIL`.
   > On the free plan the sender must be a real, verified address (e.g. your Gmail).
   > Without verification, Brevo will reject the send.
3. Copy your API key from **SMTP & API → API Keys** (click **Generate a new API
   key**, name it, and copy the value — it starts with `xkeysib-`). This becomes
   `BREVO_API_KEY`.

## 5. Create `.env.local`

Copy the example file and fill in your values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

Then open `.env.local` and fill in:

| Variable                 | Where to get it |
| ------------------------ | --------------- |
| `DATABASE_URL`           | Neon or Supabase connection string |
| `NEXTAUTH_URL`           | `http://localhost:3000` for local dev |
| `NEXTAUTH_SECRET`        | Any long random string (see below) |
| `GOOGLE_CLIENT_ID`       | Google Cloud Console (step 3) |
| `GOOGLE_CLIENT_SECRET`   | Google Cloud Console (step 3) |
| `BREVO_API_KEY`         | Brevo **SMTP & API → API Keys** (starts with `xkeysib-`) |
| `BREVO_FROM_EMAIL`      | A verified sender email (Senders page) |
| `BREVO_FROM_NAME`       | e.g. `Corner Shop` |

Generate a `NEXTAUTH_SECRET` with either of these:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
openssl rand -base64 32
```

## 6. Create the tables and load sample products

```bash
npm run db:setup
```

You should see `✅ Database is ready!`.

## 7. Run the site

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):

- Browse products and add them to the cart.
- Click **Sign in with Google**.
- Go to **Cart → Checkout**, fill in shipping details, and place the order.
- The order is saved to the database and a confirmation email is sent to your
  address (make sure your Brevo sender is verified — see step 4).
- View past orders under **My orders**.

---

## Project structure

```
app/
  page.js              Product listing (reads from the database)
  cart/page.js         Cart (stored in the browser)
  checkout/page.js     Checkout form (requires sign-in)
  order/[id]/page.js   Single order confirmation
  orders/page.js       A user's order history
  api/orders/route.js  POST endpoint: saves the order + sends the email
  api/auth/[...nextauth]/route.js  NextAuth route for Google login
components/            Header, add-to-cart button, cart state
lib/
  db.js                Shared Postgres connection (Neon/Supabase)
  auth.js              NextAuth config (Google provider + save user to DB)
  brevo.js             Sends emails through Brevo's HTTP API
  format.js            Price formatting
scripts/setup-db.mjs   Creates tables and inserts sample products
```

## How the pieces fit together

- **Google auth** — `lib/auth.js` configures the Google provider. On every
  sign-in the `signIn` callback upserts the user into the `users` table.
- **Cart** — kept in the browser's `localStorage` until checkout so you don't
  need an account to shop.
- **Orders** — `POST /api/orders` recomputes prices from the database (never
  trusting the browser), writes the order and its line items in a single
  transaction, then emails the customer and marks the order `email_sent`.
- **Emails** — `lib/brevo.js` calls Brevo's REST API directly with `fetch`,
  so no extra package is required.

## Deploying to Vercel (optional)

1. Push this folder to a GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add every variable from `.env.local` to **Project → Settings → Environment
   Variables**.
4. Change `NEXTAUTH_URL` to your real domain and add the matching
   `https://YOUR-DOMAIN/api/auth/callback/google` redirect URI in Google Cloud.
5. Deploy, then run `npm run db:setup` locally once (against the same database)
   so the tables exist in production.

## Troubleshooting

- **"Please sign in first" / 401 on checkout** — you're not signed in with
  Google; click the sign-in button first.
- **Email never arrives** — make sure your Brevo **sender is verified** and the
  `BREVO_FROM_EMAIL` matches it, and that you still have free-tier quota. Check
  the server logs for `Confirmation email failed: ...` which prints the exact
  Brevo error.
- **`redirect_uri_mismatch` from Google** — the callback URI in Google Cloud must
  exactly match `NEXTAUTH_URL + /api/auth/callback/google`.
- **"DATABASE_URL is missing"** — create `.env.local` (not `.env`) and restart
  `npm run dev`.
