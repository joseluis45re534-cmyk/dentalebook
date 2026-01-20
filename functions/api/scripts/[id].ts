
interface Env {
    DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const id = context.params.id;
    await context.env.DB.prepare("DELETE FROM scripts WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const id = context.params.id;
    const { enabled } = await context.request.json() as any;

    await context.env.DB.prepare(
        "UPDATE scripts SET enabled = ? WHERE id = ?"
    ).bind(enabled ? 1 : 0, id).run();

    return new Response(JSON.stringify({ success: true }));
};
