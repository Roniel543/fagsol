/**
 * Utilidades de sanitización HTML para prevenir XSS
 * Usa DOMPurify para limpiar contenido HTML dinámico
 */

// @ts-ignore - isomorphic-dompurify no tiene tipos, pero funciona correctamente
import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuración segura de DOMPurify
 * Permite solo etiquetas y atributos seguros
 */
const SAFE_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'width', 'height', 'class',
        'target', 'rel' // Para enlaces seguros
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    S: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
};

/**
 * Sanitiza HTML eliminando código malicioso
 * @param dirty - HTML sin sanitizar
 * @returns HTML sanitizado y seguro
 */
export function sanitizeHTML(dirty: string | null | undefined): string {
    if (!dirty) return '';

    try {
        return DOMPurify.sanitize(dirty, SAFE_CONFIG);
    } catch (error) {
        console.error('Error sanitizing HTML:', error);
        // En caso de error, devolver string vacío para máxima seguridad
        return '';
    }
}

/**
 * Sanitiza texto plano (elimina todo HTML)
 * Útil para campos de texto que no deben contener HTML
 */
export function sanitizeText(text: string | null | undefined): string {
    if (!text) return '';

    try {
        // Remover todo HTML y devolver solo texto
        return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    } catch (error) {
        console.error('Error sanitizing text:', error);
        return '';
    }
}

/**
 * Sanitiza URLs para prevenir javascript: y data: maliciosos
 */
export function sanitizeURL(url: string | null | undefined): string {
    if (!url) return '';

    // Solo permitir http, https, mailto, tel
    const safeURLPattern = /^(https?|mailto|tel):/i;

    if (safeURLPattern.test(url)) {
        return url;
    }

    // Si no es una URL segura, devolver vacío
    return '';
}

