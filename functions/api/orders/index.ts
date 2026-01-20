
import { Order } from "../../../shared/schema";

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            `SELECT 
                o.*, 
                GROUP_CONCAT(oi.product_id, ', ') as products
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             GROUP BY o.id
             ORDER BY o.created_at DESC`
        ).all<any>();

        const mappedResults = results.map(order => ({
            id: order.id,
            paymentIntentId: order.payment_intent_id,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            amount: order.amount_total,
            currency: order.currency,
            status: order.status,
            products: order.products || 'Unknown Product',
            createdAt: order.created_at * 1000 // Convert unix seconds to milliseconds for JS Date
        }));

        return new Response(JSON.stringify(mappedResults), {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
