
interface Env {
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { request, env } = context;
        const body = await request.json() as { event_type: string, path: string, metadata?: any };

        const { event_type, path, metadata } = body;

        if (!event_type) {
            return new Response("Missing event_type", { status: 400 });
        }

        await env.DB.prepare(
            `INSERT INTO analytics_events (event_type, path, metadata) VALUES (?, ?, ?)`
        ).bind(
            event_type,
            path || new URL(request.url).pathname,
            metadata ? JSON.stringify(metadata) : null
        ).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
