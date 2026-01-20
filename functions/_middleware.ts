
interface Env {
    DB: D1Database;
}

class ScriptInjector {
    constructor(private scripts: any[]) { }

    element(element: Element) {
        if (element.tagName === 'head') {
            const headScripts = this.scripts.filter(s => s.location === 'head');
            for (const script of headScripts) {
                element.append(script.content, { html: true });
            }
        } else if (element.tagName === 'body') {
            // Check if it's start or end (footer) is hard with HTMLRewriter on 'body' tag alone.
            // Usually 'body' matches the open tag. 
            // So 'on'('body') -> prepend for body_start
            // But footer usually means 'append' to body.

            const bodyStartScripts = this.scripts.filter(s => s.location === 'body_start');
            for (const script of bodyStartScripts) {
                element.prepend(script.content, { html: true });
            }

            const footerScripts = this.scripts.filter(s => s.location === 'footer');
            for (const script of footerScripts) {
                element.append(script.content, { html: true });
            }
        }
    }
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Skip API routes
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/assets/')) {
        return next();
    }

    const response = await next();

    // Only inject into HTML responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
        return response;
    }

    try {
        // Fetch enabled scripts from D1
        // Note: In high traffic, you'd want to cache this in KV or memory
        const { results } = await env.DB.prepare(
            "SELECT content, location FROM scripts WHERE enabled = 1"
        ).all();

        if (!results || results.length === 0) {
            return response;
        }

        return new HTMLRewriter()
            .on('head', new ScriptInjector(results))
            .on('body', new ScriptInjector(results))
            .transform(response);

    } catch (e) {
        console.error('Script injection failed:', e);
        // Return original response if injection fails
        return response;
    }
};
