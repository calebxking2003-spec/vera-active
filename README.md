# G300 Pit Viper–Style Site

## Run locally
- Open index.html directly, or run a local server:
  python -m http.server 5500

## Checkout setup
Option A (fast): Stripe Payment Link
- In `app.js`, set:
  window.STRIPE_PAYMENT_LINK = "https://buy.stripe.com/XXXX";

Option B (advanced): Stripe Checkout Sessions endpoint
- Set:
  window.STRIPE_CHECKOUT_ENDPOINT = "https://yourdomain.com/create-checkout-session";
- The endpoint should return JSON: { "url": "https://checkout.stripe.com/..." }
