
import Stripe from "stripe";

interface Env {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const signature = context.request.headers.get("stripe-signature");

    if (!signature) {
        return new Response("No signature", { status: 400 });
    }

    if (!context.env.STRIPE_SECRET_KEY || !context.env.STRIPE_WEBHOOK_SECRET) {
        console.error("Missing Stripe configuration");
        return new Response("Server config error", { status: 500 });
    }

    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-01-27.acacia",
    });

    try {
        const body = await context.request.text();
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            context.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            // Parse metadata to get items
            // Note: Stripe metadata has a 500 character limit per key.
            // If order is huge, this might fail unless we store order in DB first as pending.
            // For this MVP, let's assume it fits or simple structure.
            const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

            const email = session.customer_details?.email || "unknown@example.com";
            const total = (session.amount_total || 0) / 100; // Convert cents to dollars
            const paymentIntentId = session.payment_intent as string;

            // Insert Order
            const { results: orderResult } = await context.env.DB.prepare(
                `INSERT INTO orders (customer_email, total_amount, status, stripe_session_id) 
         VALUES (?, ?, ?, ?) RETURNING id`
            ).bind(email, total, 'paid', session.id).run();

            const orderId = (orderResult as any).id || (await context.env.DB.prepare("SELECT last_insert_rowid() as id").first("id"));

            if (orderId && items.length > 0) {
                // Prepare batch insert (D1 doesn't support request batching well inside Workers for write consistency easily,
                // but we can just run multiple inserts or one big insert).
                // Let's do one big insert.

                // Fetch current prices to record "price_at_purchase" accurately
                // (Optimally this came from session line_items expansion but that requires another API call)
                // Let's trust the DB prices for historical record or fetch from DB.

                // Actually, better to fetch latest product prices from DB now.
                const placeholders = items.map(() => "?").join(",");
                const itemIds = items.map((i: any) => i.id);
                const { results: products } = await context.env.DB.prepare(
                    `SELECT id, current_price FROM products WHERE id IN (${placeholders})`
                ).bind(...itemIds).all();

                const itemValues: string[] = [];
                const bindings: any[] = [];

                for (const item of items) {
                    const product: any = products.find((p: any) => p.id === item.id);
                    if (product) {
                        itemValues.push("(?, ?, ?, ?)");
                        bindings.push(orderId, product.id, item.quantity, product.current_price);
                    }
                }

                if (itemValues.length > 0) {
                    const sql = `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ${itemValues.join(", ")}`;
                    await context.env.DB.prepare(sql).bind(...bindings).run();
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
}
