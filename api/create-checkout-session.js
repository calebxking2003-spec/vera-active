import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Env vars required on Vercel (Production):
 * - STRIPE_SECRET_KEY = sk_live_...
 * - STRIPE_PRICE_ID   = price_...
 * - SITE_URL          = https://your-domain.vercel.app
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { color, size } = req.body || {};
    if (!color || !size) {
      return res.status(400).json({ error: "Missing color or size" });
    }

    const siteUrl = process.env.SITE_URL;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY env var" });
    }
    if (!siteUrl) {
      return res.status(500).json({ error: "Missing SITE_URL env var" });
    }
    if (!priceId) {
      return res.status(500).json({ error: "Missing STRIPE_PRICE_ID env var" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { color, size },
      custom_text: {
        submit: { message: `Selected: ${color} / ${size}` }
      },
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/product.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
