interface Env {
    JWT_SECRET?: string;
}

async function verify(token: string, secret: string) {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [header, body, signature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        encoder.encode(`${header}.${body}`)
    );

    if (!valid) return false;

    const payload = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, next, env } = context;

    if (!env.JWT_SECRET) {
        return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500 });
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const token = authHeader.split(" ")[1];
    const isValid = await verify(token, env.JWT_SECRET);

    if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    return next();
};
