import { sanitizeHTML, sanitizeText, sanitizeURL } from '../sanitize';

describe('sanitizeHTML', () => {
    it('debe permitir HTML seguro', () => {
        const input = '<p>Texto seguro</p>';
        const result = sanitizeHTML(input);
        expect(result).toContain('<p>Texto seguro</p>');
    });

    it('debe eliminar scripts maliciosos', () => {
        const input = '<script>alert("XSS")</script><p>Texto</p>';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('<script>');
        expect(result).toContain('<p>Texto</p>');
    });

    it('debe eliminar atributos peligrosos', () => {
        const input = '<img src="x" onerror="alert(1)">';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('onerror');
    });

    it('debe manejar null y undefined', () => {
        expect(sanitizeHTML(null)).toBe('');
        expect(sanitizeHTML(undefined)).toBe('');
    });

    it('debe permitir enlaces seguros', () => {
        const input = '<a href="https://example.com">Link</a>';
        const result = sanitizeHTML(input);
        expect(result).toContain('<a href="https://example.com">Link</a>');
    });

    it('debe bloquear javascript: en enlaces', () => {
        const input = '<a href="javascript:alert(1)">Link</a>';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('javascript:');
    });
});

describe('sanitizeText', () => {
    it('debe eliminar todo HTML', () => {
        const input = '<p>Texto con <strong>HTML</strong></p>';
        const result = sanitizeText(input);
        expect(result).toBe('Texto con HTML');
    });

    it('debe manejar null y undefined', () => {
        expect(sanitizeText(null)).toBe('');
        expect(sanitizeText(undefined)).toBe('');
    });
});

describe('sanitizeURL', () => {
    it('debe permitir URLs HTTPS', () => {
        const url = 'https://example.com';
        expect(sanitizeURL(url)).toBe(url);
    });

    it('debe permitir URLs HTTP', () => {
        const url = 'http://example.com';
        expect(sanitizeURL(url)).toBe(url);
    });

    it('debe permitir mailto', () => {
        const url = 'mailto:test@example.com';
        expect(sanitizeURL(url)).toBe(url);
    });

    it('debe bloquear javascript:', () => {
        const url = 'javascript:alert(1)';
        expect(sanitizeURL(url)).toBe('');
    });

    it('debe bloquear data:', () => {
        const url = 'data:text/html,<script>alert(1)</script>';
        expect(sanitizeURL(url)).toBe('');
    });

    it('debe manejar null y undefined', () => {
        expect(sanitizeURL(null)).toBe('');
        expect(sanitizeURL(undefined)).toBe('');
    });
});

