import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
});

class StripeService {
    
    async createCheckoutSession(priceId: string, email: string, successUrl: string, cancelUrl: string) {
        const customer = await stripe.customers.create({ email });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
        return session;
    }

    async createProduct(name: string, description: string, price: number) {
        const product = await stripe.products.create({
            name: name,
            description: "SOS Subscription",
        });
        const stripePrice = await stripe.prices.create({
            product: product.id,
            unit_amount: price * 100,
            currency: "usd",
            recurring: {
                interval: "month",
            },
        })
        return {product, stripePrice}
    }

    async updateProductPrice(productId: string, newPrice: number) {
        
        // Get existing prices and deactivate the old one(s)
        const prices = await stripe.prices.list({ product: productId, active: true });
        for (const price of prices.data) {
            await stripe.prices.update(price.id, { active: false });
        }
        // Create a new price
        const newStripePrice = await stripe.prices.create({
            product: productId,
            unit_amount: newPrice * 100,
            currency: "usd",
            recurring: { interval: "month" },
        });
        
        return newStripePrice;
    }

    async updateProduct(productId: string, updates: { name?: string; description?: string }) {
        console.log("updating product");
        const updatedProduct = await stripe.products.update(productId, updates);
        return updatedProduct;
    }
}

export default new StripeService();