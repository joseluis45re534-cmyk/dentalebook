
import Stripe from "stripe";

interface Env {
    STRIPE_SECRET_KEY: string;
    DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
        const { items } = await context.request.json() as { items: { id: number, quantity: number }[] };

        if (!items || items.length === 0) {
            return new Response(JSON.stringify({ error: "Cart is empty" }), { status: 400 });
        }

        if (!context.env.STRIPE_SECRET_KEY) {
            console.error("Missing STRIPE_SECRET_KEY");
            return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
        }

        const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-01-27.acacia", // Use latest or what's in package.json
        });

        // Fetch product details from DB to ensure prices are correct (never trust client prices!)
        const placeholders = items.map(() => "?").join(",");
        const ids = items.map(i => i.id);
        const { results: products } = await context.env.DB.prepare(
            `SELECT * FROM products WHERE id IN (${placeholders})`
        ).bind(...ids).all();

        const line_items = items.map(item => {
            const product: any = products.find((p: any) => p.id === item.id);
            if (!product) return null;

            // Ensure price is in cents for Stripe (if your DB stores dollars as float)
            // Assuming current_price is e.g. 10.50 -> 1050 cents
            const unitAmount = Math.round(product.current_price * 100);

            return {
                price_data: {
                    currency: "usd", // Or eur based on your requirements
                    product_data: {
                        name: product.title,
                        images: product.image_url ? [product.image_url] : [],
                        metadata: {
                            productId: product.id
                        }
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity,
            };
        }).filter(Boolean);

        const origin = new URL(context.request.url).origin;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items as any,
            mode: "payment",
            success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            metadata: {
                // Store item IDs to reconstruct order later if needed, though webhook is better
                items: JSON.stringify(items)
            }
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error: any) {
        console.error("Stripe Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
