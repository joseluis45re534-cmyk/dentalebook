import { verifyStripeSignature } from '../../utils/stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
        return new Response('Missing signature or secret', { status: 400 });
    }

    try {
        const isValid = await verifyStripeSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);
        if (!isValid) {
            return new Response('Invalid signature', { status: 400 });
        }

        const event = JSON.parse(body);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const { id: paymentIntentId, amount, currency, metadata, billing_details } = paymentIntent;

            console.log(`Processing successful payment: ${paymentIntentId}`);

            // 1. Check if order exists (created by checkout)
            const { results } = await env.DB.prepare(
                "SELECT id FROM orders WHERE payment_intent_id = ?"
            ).bind(paymentIntentId).all();

            if (results && results.length > 0) {
                // Update existing order with both status AND customer details
                const customerName = billing_details?.name || 'Customer';
                const customerEmail = billing_details?.email || 'paid@checkout.com';

                await env.DB.prepare(
                    "UPDATE orders SET status = 'paid', customer_name = ?, customer_email = ? WHERE payment_intent_id = ?"
                ).bind(customerName, customerEmail, paymentIntentId).run();
                console.log(`Updated existing order ${results[0].id} to paid with details for ${customerEmail}`);
            } else {
                // Create new order (Fail-safe)
                const customerName = billing_details?.name || 'Guest Customer';
                const customerEmail = billing_details?.email || 'no-email@example.com';

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
                console.log(`Created new order ${orderId} from webhook`);

                // Restore items from metadata if available
                if (metadata && metadata.cart_items) {
                    try {
                        const cartItems = JSON.parse(metadata.cart_items);
                        if (Array.isArray(cartItems) && cartItems.length > 0) {
                            const stmt = env.DB.prepare(
                                `INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)`
                            );
                            const batch = cartItems.map((item: any) =>
                                stmt.bind(orderId, item.id, item.title, item.quantity, item.price)
                            );
                            await env.DB.batch(batch);
                        }
                    } catch (e) {
                        console.error('Failed to parse metadata items', e);
                    }
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
};
