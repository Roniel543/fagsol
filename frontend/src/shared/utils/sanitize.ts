/**
 * Sanitización segura para Next.js 14 (App Router + Turbopack)
 * Funciona tanto en servidor como en cliente
 */

import type { Config } from "dompurify";

/**
 * Config compartida
 */
const SAFE_CONFIG: Config = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'width', 'height', 'class',
        'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

/**
 * Obtiene una instancia de DOMPurify válida para SSR o Client
 */
async function getPurifier() {
    // Cliente: usa DOMPurify directamente
    if (typeof window !== "undefined") {
        const DOMPurify = (await import("dompurify")).default;
        return DOMPurify;
    }

    // Servidor: necesita JSDOM (solo se ejecuta en el servidor)
    // Usar import dinámico para evitar que se empaquete para el cliente
    try {
        const jsdomModule = await import("jsdom");
        const { JSDOM } = jsdomModule;
        const createDOMPurify = (await import("dompurify")).default;

        const jsdomWindow = new JSDOM("").window;
        return createDOMPurify(jsdomWindow);
    } catch (error) {
        // Si jsdom no está disponible (no debería pasar en el servidor),
        // devolver una función que solo limpia el HTML básico
        console.error("Error loading jsdom:", error);
        return {
            sanitize: (dirty: string, _config?: Config) => {
                // Fallback básico: eliminar tags peligrosos
                return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
        } as any; // Type assertion para compatibilidad con DOMPurify
    }
}

/**
 * Sanitiza HTML
 */
export async function sanitizeHTML(dirty: string | null | undefined): Promise<string> {
    if (!dirty) return "";
    try {
        const purifier = await getPurifier();
        return purifier.sanitize(dirty, SAFE_CONFIG);
    } catch (e) {
        console.error("SanitizeHTML error:", e);
        return "";
    }
}

/**
 * Sanitiza texto plano
 */
export async function sanitizeText(text: string | null | undefined): Promise<string> {
    if (!text) return "";
    try {
        const purifier = await getPurifier();
        return purifier.sanitize(text, { ALLOWED_TAGS: [] });
    } catch (e) {
        console.error("SanitizeText error:", e);
        return "";
    }
}

/**
 * Sanitiza URLs
 */
export function sanitizeURL(url: string | null | undefined): string {
    if (!url) return "";
    const safeURLPattern = /^(https?|mailto|tel):/i;
    return safeURLPattern.test(url) ? url : "";
}
