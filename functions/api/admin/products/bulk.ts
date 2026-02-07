
interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const body: any = await context.request.json();

        if (!Array.isArray(body)) {
            return new Response(JSON.stringify({ error: "Input must be an array of products" }), { status: 400 });
        }

        const products = body;
        const statements = products.map((product: any) => {
            return context.env.DB.prepare(
                `INSERT INTO products (title, description, price, current_price, original_price, is_on_sale, url, image_file, image_url, images, category) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                product.title,
                product.description || "",
                product.price || "$0.00",
                product.currentPrice || 0,
                product.originalPrice || null,
                product.isOnSale ? 1 : 0,
                product.url || "",
                product.imageFile || "",
                product.imageUrl || "",
                JSON.stringify(product.images || []), // Store images as JSON string
                product.category || "books"
            );
        });

        // Split into chunks of 100 to avoid D1 limits if necessary, though batch usually handles a fair amount.
        // D1 limit is 100 statements per batch.
        const chunkSize = 50;
        for (let i = 0; i < statements.length; i += chunkSize) {
            const batch = statements.slice(i, i + chunkSize);
            await context.env.DB.batch(batch);
        }

        return new Response(JSON.stringify({ success: true, count: products.length }), {
            status: 201, headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("Bulk Import Error:", e);
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
