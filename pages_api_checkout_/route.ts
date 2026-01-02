import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Create a Checkout Session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: 'Testimonial Automator Pro' },
              unit_amount: 900, // $9.00 in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/`,
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
