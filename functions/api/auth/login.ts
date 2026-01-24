interface Env {
    DB: D1Database;
    ADMIN_PASSWORD?: string;
    JWT_SECRET?: string;
}

// Minimal JWT implementation using Web Crypto API
async function sign(payload: any, secret: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const header = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const body = JSON.stringify(payload);

    const b64Header = btoa(header).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const b64Body = btoa(body).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(`${b64Header}.${b64Body}`)
    );

    const b64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${b64Header}.${b64Body}.${b64Signature}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body: any = await request.json();
        const { password } = body;

        // Use environment variable or fallback for safe failure
        const CORRECT_PASSWORD = env.ADMIN_PASSWORD;
        const JWT_SECRET = env.JWT_SECRET;

        // Debugging keys (Safe: only shows valid keys, not values)
        const availableKeys = Object.keys(env);

        // Security Check: If secrets are missing, fail securely
        if (!CORRECT_PASSWORD || !JWT_SECRET) {
            return new Response(JSON.stringify({
                error: "Secrets not detected by server.",
                details: `Missing: ${!CORRECT_PASSWORD ? 'ADMIN_PASSWORD ' : ''}${!JWT_SECRET ? 'JWT_SECRET' : ''}`,
                env_keys_found: availableKeys.join(', ')
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        if (password === CORRECT_PASSWORD) {
            // Create a token valid for 24 hours
            const now = Math.floor(Date.now() / 1000);
            const payload = {
                sub: "admin",
                iat: now,
                exp: now + (24 * 60 * 60) // 24 hours
            };

            const token = await sign(payload, JWT_SECRET);

            return new Response(JSON.stringify({ success: true, token }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ error: "Invalid password" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message || "Server error" }), { status: 500 });
    }
}
