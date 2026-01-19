import Stripe from 'stripe';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;

        // 1. Get cart items from request body
        const { items } = await request.json() as { items: { id: number; quantity: number }[] };

        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'Cart is empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Validate items by fetching real prices from D1
        // We cannot trust prices sent from the client
        const productIds = items.map(i => i.id).join(',');
        /* 
           Note: fetching via specific IDs securely. 
           Using a simple query here since we don't have an ORM in this file yet 
           or we can reuse the connection if we setup shared db utils, 
           but for raw Pages Functions, direct binding usage is common.
        */

        // Handle case where productIds might be empty string if items is empty (already checked above)
        const query = `SELECT id, title, current_price FROM products WHERE id IN (${productIds})`;
        const { results } = await env.DB.prepare(query).all();

        if (!results || results.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid products found' }), { status: 400 });
        }

        // 3. Construct Stripe Line Items
        const line_items = items.map(item => {
            const product = results.find((p: any) => p.id === item.id);
            if (!product) return null;

            return {
                price_data: {
                    currency: 'usd', // Assuming USD for now based on context or defaulting
                    product_data: {
                        name: product.title,
                    },
                    // Stripe expects amount in cents
                    unit_amount: Math.round(product.current_price * 100),
                },
                quantity: item.quantity,
            };
        }).filter(Boolean);

        if (line_items.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid items to create checkout' }), { status: 400 });
        }

        // 4. Create PaymentIntent (for Embedded Checkout)
        if (!env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-01-27.acacia',
        });

        // Calculate total amount
        const totalAmount = line_items.reduce((sum, item) => {
            // @ts-ignore
            return sum + (item.price_data.unit_amount * item.quantity);
        }, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            // In latest Stripe API, automatic_payment_methods is enabled by default 
            // but explicitly setting it is good practice for Elements
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                cart_items: JSON.stringify(items)
            }
        });

        return new Response(JSON.stringify({
            clientSecret: paymentIntent.client_secret
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
