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
            const { metadata, billing_details, amount, currency, id: paymentIntentId } = paymentIntent;

            const cartItems = JSON.parse(metadata.cart_items || '[]');
            const customerName = paymentIntent.payment_method_options?.card?.request_three_d_secure === 'any' ? billing_details.name : (billing_details.name || 'Unknown');
            const customerEmail = billing_details.email || 'unknown@example.com';

            // NOTE: billing_details usually comes from the payment_method attached. 
            // In 'payment_intent.succeeded', top-level billing_details might be incomplete depending on integration.
            // We should ensure we capture the email/name correctly from where Stripe puts it.
            // For Elements, specifically LinkAuthenticationElement + PaymentElement, they populate the payment_method.

            // Insert Order
            const { results } = await env.DB.prepare(
                `INSERT INTO orders (payment_intent_id, customer_name, customer_email, amount_total, currency, status) 
                 VALUES (?, ?, ?, ?, ?, ?) RETURNING id`
            ).bind(
                paymentIntentId,
                customerName || 'Customer',
                customerEmail,
                amount, // stored in cents
                currency,
                'paid'
            ).all();

            const orderId = results[0].id;

            // Insert Order Items
            if (cartItems.length > 0) {
                const stmt = env.DB.prepare(
                    `INSERT INTO order_items (order_id, product_id, product_title, quantity, price) VALUES (?, ?, ?, ?, ?)`
                );

                const batch = cartItems.map((item: any) =>
                    stmt.bind(orderId, item.id, item.title, item.quantity, item.price)
                );

                await env.DB.batch(batch);
            }

            console.log(`Order ${orderId} created successfully for PaymentIntent ${paymentIntentId}`);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
};
