
interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { env } = context;

        // 1. Total Review & Orders
        const { results: salesStats } = await env.DB.prepare(
            `SELECT 
                COUNT(*) as total_orders, 
                SUM(amount_total) as total_revenue 
             FROM orders 
             WHERE status = 'paid'`
        ).all();

        // 2. Top Products
        const { results: topProducts } = await env.DB.prepare(
            `SELECT 
                product_title, 
                SUM(quantity) as total_sold 
             FROM order_items 
             GROUP BY product_title 
             ORDER BY total_sold DESC 
             LIMIT 5`
        ).all();

        // 3. Page Views (Analytics)
        // Check if table exists first to avoid error if migration just ran
        // Actually migration is strictly ordered, so we assume it exists.
        const { results: viewStats } = await env.DB.prepare(
            `SELECT count(*) as total_views FROM analytics_events WHERE event_type = 'page_view'`
        ).all();

        // 4. Recent Activity
        const { results: recentEvents } = await env.DB.prepare(
            `SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 10`
        ).all();


        return new Response(JSON.stringify({
            orders: salesStats[0].total_orders || 0,
            revenue: salesStats[0].total_revenue || 0,
            views: viewStats[0].total_views || 0,
            topProducts,
            recentEvents
        }), {
            headers: {
                "Content-Type": "application/json",
            },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
