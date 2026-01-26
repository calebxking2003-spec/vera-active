# Deploy to Vercel (Stripe Checkout)

## 1) Add Environment Variables in Vercel
Project → Settings → Environment Variables:

- STRIPE_SECRET_KEY = sk_test_... or sk_live_...
- STRIPE_PRICE_ID = price_...
- SITE_URL = https://YOUR-DOMAIN.com  (no trailing slash)

## 2) Deploy
Upload this folder to a GitHub repo and import into Vercel.

## 3) Test
Open your site → pick color/size → click CHECKOUT.

If you see "Checkout error", check Vercel logs and confirm env vars are set for the same environment (Preview vs Production).
