import { Product } from "../../../shared/schema";

interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare("SELECT * FROM products ORDER BY id DESC").all();

        // Map snake_case DB columns to camelCase API response
        const products = results.map((row: any) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            price: row.price,
            currentPrice: row.current_price,
            originalPrice: row.original_price,
            isOnSale: Boolean(row.is_on_sale),
            url: row.url,
            imageFile: row.image_file,
            imageUrl: row.image_url,
            category: row.category
        }));

        return new Response(JSON.stringify(products), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}


