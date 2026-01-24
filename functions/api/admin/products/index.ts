import { Product } from "../../../shared/schema";

interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body: any = await context.request.json();

        // Basic validation
        if (!body.title || !body.price) {
            return new Response(JSON.stringify({ error: "Title and Price are required" }), { status: 400 });
        }

        const { success } = await context.env.DB.prepare(
            `INSERT INTO products (title, description, price, current_price, original_price, is_on_sale, url, image_file, image_url, category) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            body.title,
            body.description || "",
            body.price,
            body.currentPrice || 0,
            body.originalPrice || null,
            body.isOnSale ? 1 : 0,
            body.url || "",
            body.imageFile || "",
            body.imageUrl || "",
            body.category || "books"
        ).run();

        if (success) {
            return new Response(JSON.stringify({ success: true }), {
                status: 201, headers: { "Content-Type": "application/json" }
            });
        } else {
            throw new Error("Failed to insert");
        }

    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
