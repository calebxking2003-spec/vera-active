VÉRA ACTIVE — Deploy Notes (Vercel)

1) Upload ALL files to the repo root (main branch).
   You must see: api/  assets/  index.html  product.html  styles.css  app.js  package.json

2) In Vercel → Project → Settings → Environment Variables (Production):
   - STRIPE_SECRET_KEY = sk_live_...
   - STRIPE_PRICE_ID   = price_...
   - SITE_URL          = https://YOUR-PROD-DOMAIN.vercel.app

3) Redeploy the latest Production deployment.

If /api/create-checkout-session shows {"error":"Method not allowed"} in the browser, that's correct.
Checkout only works via POST when you click Buy now on the product page.
