
interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT * FROM scripts ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { name, content, location } = await context.request.json() as any;

        if (!name || !content || !['head', 'body_start', 'footer'].includes(location)) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
        }

        const { results } = await context.env.DB.prepare(
            "INSERT INTO scripts (name, content, location, enabled) VALUES (?, ?, ?, 1) RETURNING *"
        ).bind(name, content, location).all();

        return new Response(JSON.stringify(results[0]), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
};
