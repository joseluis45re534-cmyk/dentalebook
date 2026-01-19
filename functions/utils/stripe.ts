export async function verifyStripeSignature(
    payload: string,
    sigHeader: string,
    secret: string
) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const [t, v1] = sigHeader.split(",").map(part => part.split("=")[1]);
    const signedPayload = `${t}.${payload}`;

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signedPayload)
    );

    const signatureHex = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return signatureHex === v1;
}
