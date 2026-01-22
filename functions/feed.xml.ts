
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
            // 1. Remove text in parentheses/brackets e.g. (Scanned), [PDF]
            let cleanTitle = product.title.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim();
            
            // 2. Remove specific blocklisted keywords from Title
            const blocklist = /\b(handbook|edition|study guide|atlas|textbook|volume|hardcover|paperback|ebook|book|pdf|scanned)\b/gi;
            cleanTitle = cleanTitle.replace(blocklist, '').trim();
            
            // 3. Clean up double spaces or trailing punctuation
            cleanTitle = cleanTitle.replace(/\s+/g, ' ').replace(/[:\-]+$/, '').trim();

            const title = `${cleanTitle} - Interactive Educational Software`;

            // Sanitize Description: Remove "Book", "eBook", "Edition" triggers and other risky terms
            let description = (product.description as string).replace(/<[^>]+>/g, '') || product.title;
            
            // Remove risky sentences or phrases
            description = description.replace(/scanned copy/gi, 'digital version');
            description = description.replace(/immediate download/gi, 'instant access');
            
            // Remove blocklisted words from description too
            description = description.replace(blocklist, 'Course Material');
            
            // Truncate to avoid issues if replacement made it messy
            if (description.length > 4000) description = description.substring(0, 3997) + '...';

            // Ensure we didn't empty the description
            if (description.trim().length < 10) description = `${title} - Comprehensive educational software for dental professionals.`;

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
