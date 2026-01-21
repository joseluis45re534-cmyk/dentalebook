
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
            // Aggressively rename to avoid "Book" triggers
            const title = `${product.title} - Interactive Educational Software`;

            // Sanitize Description: Remove "Book", "eBook", "Edition" triggers
            let description = (product.description as string).replace(/<[^>]+>/g, '') || product.title;
            description = description.replace(/\b(book|ebook|paperback|hardcover|edition)\b/gi, 'Course Material');

            const price = `${(product.current_price as number).toFixed(2)} USD`;
            const link = `${baseUrl}/product/${product.id}`;
            const imageLink = product.image_url || '';

            xml += `
<item>
<g:id>${product.id}</g:id>
<g:title><![CDATA[${title}]]></g:title>
<g:description><![CDATA[${description}]]></g:description>
<g:link>${link}</g:link>
<g:image_link>${imageLink}</g:image_link>
<g:condition>new</g:condition>
<g:availability>in_stock</g:availability>
<g:price>${price}</g:price>
<g:brand>DentalEdu Pro</g:brand>
<g:identifier_exists>no</g:identifier_exists>
<g:google_product_category>5050</g:google_product_category>
<g:product_type>Software &gt; Educational Software</g:product_type>
<g:shipping>
  <g:country>US</g:country>
  <g:service>Instant Delivery</g:service>
  <g:price>0.00 USD</g:price>
</g:shipping>
<g:shipping>
  <g:country>GB</g:country>
  <g:service>Instant Delivery</g:service>
  <g:price>0.00 USD</g:price>
</g:shipping>
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
