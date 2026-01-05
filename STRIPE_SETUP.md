# Stripe Integration (Placeholder)
This static site can't "connect to your Stripe from another website" automatically.
To accept payments you have 2 clean options:

## Option A (Fastest): Stripe Payment Link
1) Create a Stripe Payment Link in your Stripe Dashboard.
2) Replace the checkout button URL to that link.

## Option B (Best): Stripe Checkout Session (API)
1) Create a small server (Node/Next/Cloudflare) with your Stripe secret key.
2) Create a Checkout Session and redirect the user.
Files needed:
- server/create-checkout-session endpoint
- success.html / cancel.html

This repo includes placeholders only (no keys stored in code).
