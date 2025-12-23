VÉRA ACTIVE — Luxury Rebuild (Vercel)

1) Upload ALL files to GitHub repo ROOT (main).
   You must see: api/ assets/ index.html product.html styles.css app.js package.json ...

2) Vercel → Project → Settings → Environment Variables (Production):
   STRIPE_SECRET_KEY = sk_live_...   (ROTATED, keep private)
   STRIPE_PRICE_ID   = price_...
   SITE_URL          = https://YOUR-PRODUCTION-DOMAIN

3) Redeploy latest Production deployment.

Buy flow: Product page → Buy now → /api/create-checkout-session (POST) → Stripe Checkout.
Color & size are stored in metadata and shown in checkout submit text.
