import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { color, size } = req.body || {};
    if (!color || !size) return res.status(400).json({ error: "Missing color or size" });

    const variantName = `ContourZip One-Piece — ${color} / ${size}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,

      // Use dynamic price_data so Checkout visibly shows the chosen color/size
      line_items: [{
        price_data: {
          currency: "cad",
          unit_amount: 6499,
          product_data: {
            name: variantName,
            description: "Strong. Sculpted. Unstoppable."
          }
        },
        quantity: 1
      }],

      metadata: { color, size },

      success_url: `${process.env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/product-contourzip-onepiece.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
