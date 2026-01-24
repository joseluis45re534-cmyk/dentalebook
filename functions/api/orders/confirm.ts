import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const { paymentIntentId } = await request.json() as { paymentIntentId: string };

        if (!paymentIntentId) {
            return new Response(JSON.stringify({ error: 'Missing payment_intent_id' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is missing');
        }

        // 1. Verify with Stripe
        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16' as any,
        });

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return new Response(JSON.stringify({ error: `Payment not successful. Status: ${paymentIntent.status}` }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Mark Order as Paid
        // We only update if it is currently 'pending' to avoid overwriting other states if we add them later
        // But for now, just force 'paid' is fine.
        const { results } = await env.DB.prepare(
            "UPDATE orders SET status = 'paid' WHERE payment_intent_id = ? RETURNING id"
        ).bind(paymentIntentId).all();

        if (!results || results.length === 0) {
            // Note: In a perfect world we might create the order here if missing, 
            // but our Two-Step checkout guarantees creation before payment.
            // If it's missing here, something is very wrong (invalid ID).
            return new Response(JSON.stringify({ error: 'Order not found for this payment' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ success: true, orderId: results[0].id }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Confirmation Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
