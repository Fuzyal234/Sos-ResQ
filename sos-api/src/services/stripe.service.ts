import Stripe from 'stripe';
import { SosUser } from '../models';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UUID } from 'crypto';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});

class StripeService {
  async createCheckoutSession(
    priceId: string,
    email: string,
    sos_user_id: UUID,
  ) {
    const success_url = 'https://google.com';
    const cancel_url = 'https://apple.com';
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data.length > 0 ? customers.data[0] : null;

    if (!customer) {
      console.log('creating new stripe customer');
      customer = await stripe.customers.create({ email });
    }
    const sos_user = await SosUser.findByPk(sos_user_id);

    sos_user?.set('stripe_cus_id', customer.id);
    await sos_user?.save();

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: {
        sos_user_id: sos_user_id,
      },
      subscription_data: {
        metadata: {
          sos_user_id: sos_user_id,
        },
      },
    });
    console.log('session.url :>> ', session.url);
    return session;
  }

  async createProduct(name: string, description: string, price: number) {
    const product = await stripe.products.create({
      name: name,
      description: 'SOS Subscription',
    });
    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: price * 100,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    return { product, stripePrice };
  }

  async updateProductPrice(productId: string, newPrice: number) {
    // Get existing prices and deactivate the old one(s)
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });
    for (const price of prices.data) {
      await stripe.prices.update(price.id, { active: false });
    }
    // Create a new price
    const newStripePrice = await stripe.prices.create({
      product: productId,
      unit_amount: newPrice * 100,
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    return newStripePrice;
  }

  async updateProduct(
    productId: string,
    updates: { name?: string; description?: string },
  ) {
    console.log('updating product');
    const updatedProduct = await stripe.products.update(productId, updates);
    return updatedProduct;
  }
}

export default new StripeService();
