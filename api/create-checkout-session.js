const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const ALLOWED_VARIANTS = new Set(["black","blue","orange"]);
const ALLOWED_SIZES = new Set(["small","large"]);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Method not allowed" });
  }

  try {
    const { variant, size } = req.body || {};

    if (!ALLOWED_VARIANTS.has(variant) || !ALLOWED_SIZES.has(size)) {
      res.statusCode = 400;
      return res.json({ error: "Invalid options" });
    }

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID || !process.env.SITE_URL) {
      res.statusCode = 500;
      return res.json({ error: "Missing env vars" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.SITE_URL}/?success=1`,
      cancel_url: `${process.env.SITE_URL}/?canceled=1`,
      metadata: { product: "G300 RAZE", variant, size },
      shipping_address_collection: {
        allowed_countries: ["CA","US","GB","AU","NZ","DE","FR","ES","IT","NL","SE","NO","DK","FI","IE","JP","SG","HK"]
      },
      phone_number_collection: { enabled: true }
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.json({ error: "Checkout failed" });
  }
};
