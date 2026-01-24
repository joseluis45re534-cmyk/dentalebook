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


