# G300 RAZE — Deploy on Vercel (Stripe Checkout)

## 1) Add Environment Variables (Production)
Vercel → Project → Settings → Environment Variables:

- STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
- STRIPE_PRICE_ID  = price_...
- SITE_URL         = https://your-domain.com   (no trailing slash)

Then click **Redeploy**.

## 2) Install deps (if running locally)
npm install

## 3) Test
Pick Color + Size → click Buy / Checkout → Stripe Checkout opens.
In Stripe Dashboard → Payment → Metadata shows variant + size.
