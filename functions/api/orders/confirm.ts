import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const { paymentIntentId } = await request.json() as { paymentIntentId: string };

        if (!paymentIntentId) {
            return new Response(JSON.stringify({ error: 'Missing paymentIntentId' }), { status: 400 });
        }

        // 1. Verify Payment Intent with Stripe
        if (!env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' as any,
        });

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return new Response(JSON.stringify({ error: 'Payment not successful' }), { status: 400 });
        }

        // 2. Check if Order already exists to prevent duplicates
        // Note: payment_intent_id is UNIQUE in our schema, so DB would also throw error, but checking is cleaner
        const { results: existing } = await env.DB.prepare(
            "SELECT id FROM orders WHERE payment_intent_id = ?"
        ).bind(paymentIntentId).all();

        if (existing && existing.length > 0) {
            // Already saved, just return success
            return new Response(JSON.stringify({
                success: true,
                orderId: existing[0].id,
                message: 'Order already confirmed'
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        // 3. Create Order from Metadata (trusted because it comes from Stripe API)
        const { metadata, billing_details, amount, currency } = paymentIntent;
        const cartItems = JSON.parse(metadata.cart_items || '[]');

        // Use billing details from Stripe (more reliable than client input at this stage)
        const customerName = paymentIntent.payment_method_options?.card?.request_three_d_secure === 'any' ? billing_details.name : (billing_details.name || 'Customer');
        const customerEmail = billing_details.email || 'unknown@example.com';

        const { results: insertResult } = await env.DB.prepare(
            `INSERT INTO orders (payment_intent_id, customer_name, customer_email, amount_total, currency, status) 
             VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
        ).bind(
            paymentIntentId,
            customerName,
            customerEmail,
            amount,
            currency,
            'paid'
        ).all();

        const orderId = insertResult[0].id;

        // 4. Insert Order Items
        if (cartItems.length > 0) {
            const stmt = env.DB.prepare(
                `INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)`
            );

            const batch = cartItems.map((item: any) =>
                stmt.bind(orderId, item.id, item.title, item.quantity, item.price)
            );

            await env.DB.batch(batch);
        }

        return new Response(JSON.stringify({ success: true, orderId }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Order Confirmation Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
