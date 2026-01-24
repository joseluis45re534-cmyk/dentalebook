
interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const { paymentIntentId, name, email } = await request.json() as {
            paymentIntentId: string;
            name: string;
            email: string;
        };

        if (!paymentIntentId) return new Response('Missing PID', { status: 400 });

        await env.DB.prepare(
            "UPDATE orders SET customer_name = ?, customer_email = ? WHERE payment_intent_id = ?"
        ).bind(name || 'Guest', email || 'pending@checkout.com', paymentIntentId).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
};
