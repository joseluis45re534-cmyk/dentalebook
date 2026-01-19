
import { Order } from "../../../shared/schema";

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM orders ORDER BY created_at DESC"
        ).all<Order>();

        return new Response(JSON.stringify(results), {
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
