interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const id = context.params.id;
    const row: any = await context.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();

    if (!row) {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const product = {
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
    };

    return new Response(JSON.stringify(product), {
        headers: { "Content-Type": "application/json" }
    });
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const id = context.params.id;
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
            body.originalPrice,
            body.isOnSale ? 1 : 0,
            body.url,
            body.imageFile,
            body.imageUrl,
            body.category,
            id
        ).run();

        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const id = context.params.id;
    try {
        const { success } = await context.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
        return new Response(JSON.stringify({ success }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
    }
}
