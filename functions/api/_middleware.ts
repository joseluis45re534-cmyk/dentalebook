export const onRequest: PagesFunction = async (context) => {
    const url = new URL(context.request.url);

    // Only intercept /api/admin/* routes
    if (url.pathname.startsWith("/api/admin")) {
        const authHeader = context.request.headers.get("Authorization");

        if (!authHeader || authHeader !== "Bearer mock-admin-token") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    return context.next();
}
