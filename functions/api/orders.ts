
interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        // Fetch orders with latest first
        const { results: orders } = await context.env.DB.prepare(
            `SELECT * FROM orders ORDER BY created_at DESC LIMIT 50`
        ).all();

        // For each order, we *could* fetch items, but that's N+1 queries.
        // D1 is fast, but let's see. 
        // Maybe just return orders first, and fetch details on separate call if needed.
        // Or do a single query to get items for these orders.

        if (orders.length === 0) {
            return new Response(JSON.stringify([]), {
                headers: { "Content-Type": "application/json" }
            });
        }

        const orderIds = orders.map((o: any) => o.id).join(",");
        const { results: items } = await context.env.DB.prepare(
            `SELECT oi.*, p.title, p.image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id IN (${orderIds})`
        ).all();

        // Map items to orders
        const ordersWithItems = orders.map((order: any) => {
            return {
                ...order,
                totalAmount: order.total_amount, // map snake to camel
                customerEmail: order.customer_email,
                createdAt: order.created_at,
                stripeSessionId: order.stripe_session_id,
                items: items.filter((i: any) => i.order_id === order.id).map((i: any) => ({
                    id: i.id,
                    productId: i.product_id,
                    quantity: i.quantity,
                    priceAtPurchase: i.price_at_purchase,
                    productTitle: i.title,
                    productImage: i.image_url
                }))
            };
        });

        return new Response(JSON.stringify(ordersWithItems), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
