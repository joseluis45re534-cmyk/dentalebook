
interface Env {
    DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, title, description, current_price, image_url, category FROM products"
        ).all();

        if (!results || results.length === 0) {
            return new Response('No products found', { status: 404 });
        }

        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Digital Listings</title>
<link>${baseUrl}</link>
<description>Digital Listings Product Feed</description>
`;

        for (const product of results) {
            // Clean Description (strip HTML to be safe, though CDATA handles it usually)
            const description = (product.description as string).replace(/<[^>]+>/g, '') || product.title;
            const price = `${(product.current_price as number).toFixed(2)} USD`;
            const link = `${baseUrl}/product/${product.id}`;
            const imageLink = product.image_url || '';

            xml += `
<item>
<g:id>${product.id}</g:id>
<g:title><![CDATA[${product.title}]]></g:title>
<g:description><![CDATA[${description}]]></g:description>
<g:link>${link}</g:link>
<g:image_link>${imageLink}</g:image_link>
<g:condition>new</g:condition>
<g:availability>in_stock</g:availability>
<g:price>${price}</g:price>
<g:brand>Digital Listings</g:brand>
<g:identifier_exists>no</g:identifier_exists>
</item>`;
        }

        xml += `
</channel>
</rss>`;

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (e: any) {
        return new Response(`Error generating feed: ${e.message}`, { status: 500 });
    }
};
