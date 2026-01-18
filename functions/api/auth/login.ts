interface Env {
    DB: D1Database;
    ADMIN_PASSWORD_HASH: string; // Set this in Cloudflare Pages secrets
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body: any = await request.json();
        const { password } = body;

        // TODO: use bcrypt or similar for real hashing. 
        // For now, doing a simple comparison with an environment variable for the MVP foundation.
        // In production, you would fetch a hashed password from env or DB and compare.
        const CORRECT_PASSWORD = env.ADMIN_PASSWORD || "admin123"; // Fallback for dev

        if (password === CORRECT_PASSWORD) {
            // Simple session / token logic
            // structured Clone is needed for deep object copying in Cloudflare Workers if we were doing complex things, 
            // but here we just return a simple JSON.

            // In a real app, sign a JWT here. 
            // For this static-first approach, we'll return a success flag and let the client handle the state 
            // (or set a secure cookie if we want strict server-side sessions).

            return new Response(JSON.stringify({ success: true, token: "mock-admin-token" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "Invalid password" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}
