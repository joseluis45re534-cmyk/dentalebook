interface Env {
    DB: D1Database;
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const id = Number(context.params.id);
    try {
        const body: any = await context.request.json();

        const { success } = await context.env.DB.prepare(
            `UPDATE products SET 
                title = ?, description = ?, price = ?, current_price = ?, original_price = ?, 
                is_on_sale = ?, url = ?, image_file = ?, image_url = ?, category = ?
             WHERE id = ?`
        ).bind(
            body.title,
            body.description,
            body.price,
            body.currentPrice,
            body.originalPrice || null,
            body.isOnSale ? 1 : 0,
            body.url,
            body.imageFile || null,
            body.imageUrl,
            body.category,
            id
        ).run();

        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error("Failed to update product:", e);
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const id = Number(context.params.id);
    try {
        const { success } = await context.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error("Failed to delete product:", e);
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
