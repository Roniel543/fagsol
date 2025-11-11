'use client';

import { sanitizeHTML } from '@/shared/utils/sanitize';

interface SafeHTMLProps {
    html: string | null | undefined;
    className?: string;
    tag?: keyof JSX.IntrinsicElements;
}

/**
 * Componente para renderizar HTML sanitizado de forma segura
 * Previene ataques XSS al sanitizar todo el contenido HTML
 */
export function SafeHTML({ html, className, tag: Tag = 'div' }: SafeHTMLProps) {
    if (!html) return null;

    const sanitized = sanitizeHTML(html);

    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

