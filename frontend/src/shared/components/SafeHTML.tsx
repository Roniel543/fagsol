'use client';

import { sanitizeHTML } from '@/shared/utils/sanitize';
import { useEffect, useState } from 'react';

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
    const [sanitized, setSanitized] = useState<string>('');

    useEffect(() => {
        if (!html) {
            setSanitized('');
            return;
        }

        sanitizeHTML(html).then(setSanitized);
    }, [html]);

    if (!html) return null;

    if (!sanitized) {
        return <Tag className={className} />;
    }

    return (
        <Tag
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

