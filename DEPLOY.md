# Deploy (Vercel + Stripe Checkout)

## Vercel Env Vars (Production)
- STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
- STRIPE_PRICE_ID  = price_...
- SITE_URL         = https://your-domain.com   (no trailing slash)

## Deploy
Push this folder to GitHub and import into Vercel (or drag/drop if supported).

## Test
Pick color + size → click BUY/CHECKOUT → you should be redirected to Stripe Checkout.
