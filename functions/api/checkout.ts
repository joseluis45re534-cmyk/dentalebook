import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;

        const { items } = await request.json() as { items: { id: number; quantity: number }[] };

        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: 'Cart is empty' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const productIds = items.map(i => i.id).join(',');

        // Use a safe fallback for empty list which shouldn't happen due to check above
        const query = `SELECT id, title, current_price FROM products WHERE id IN (${productIds || '0'})`;
        const { results } = await env.DB.prepare(query).all();

        if (!results || results.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid products found' }), { status: 400 });
        }

        // Construct valid line items including the original ID for metadata reference
        const validItems = items.map(item => {
            const product = results.find((p: any) => p.id === item.id);
            if (!product) return null;

            return {
                original_id: item.id, // Keep track of ID
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                    },
                    unit_amount: Math.round(product.current_price * 100),
                },
                quantity: item.quantity,
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        if (validItems.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid items to create checkout' }), { status: 400 });
        }

        if (!env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' as any, // Use a known stable version or cast to any if types are old
        });

        const totalAmount = validItems.reduce((sum, item) => {
            // @ts-ignore
            return sum + (item.price_data.unit_amount * item.quantity);
        }, 0);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                // Store critical order info in metadata locally so Webhook doesn't need to re-query DB for titles
                cart_items: JSON.stringify(validItems.map(item => ({
                    id: item.original_id,
                    quantity: item.quantity,
                    // @ts-ignore
                    title: item.price_data.product_data.name,
                    // @ts-ignore
                    price: item.price_data.unit_amount
                })))
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
