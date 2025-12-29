/**
 * Sistema de logging centralizado
 * Controla qué se muestra en la consola y evita exponer información sensible
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    showInProduction: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const config: LoggerConfig = {
    enabled: process.env.NODE_ENV === 'development',
    level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'warn',
    showInProduction: false,
};

/**
 * Sanitiza mensajes para evitar exponer información sensible
 */
function sanitizeMessage(message: string): string {
    // Patrones a ocultar
    const sensitivePatterns = [
        /password["\s:=]+[^,\s}]+/gi,
        /token["\s:=]+[^,\s}]+/gi,
        /secret["\s:=]+[^,\s}]+/gi,
        /api[_-]?key["\s:=]+[^,\s}]+/gi,
        /authorization["\s:=]+[^,\s}]+/gi,
    ];

    let sanitized = message;
    sensitivePatterns.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, (match) => {
            return match.split('=')[0] + '=***REDACTED***';
        });
    });

    return sanitized;
}

/**
 * Logger centralizado
 */
class Logger {
    private shouldLog(level: LogLevel): boolean {
        if (!config.enabled && !config.showInProduction) {
            return false;
        }
        return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
    }

    debug(message: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(`[DEBUG] ${sanitizeMessage(message)}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(`[INFO] ${sanitizeMessage(message)}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${sanitizeMessage(message)}`, ...args);
        }
    }

    error(message: string, error?: Error | unknown, ...args: any[]): void {
        if (this.shouldLog('error')) {
            const sanitizedMessage = sanitizeMessage(message);

            // No mostrar stack traces completos, solo el mensaje
            if (error instanceof Error) {
                // Solo mostrar el mensaje, no el stack trace completo
                console.error(`[ERROR] ${sanitizedMessage}: ${sanitizeMessage(error.message)}`);
            } else {
                console.error(`[ERROR] ${sanitizedMessage}`, error, ...args);
            }
        }
    }

    /**
     * Log de requests API (solo en desarrollo, sin información sensible)
     */
    apiRequest(method: string, endpoint: string): void {
        if (this.shouldLog('debug')) {
            // No mostrar parámetros ni body completo
            console.log(`🔗 ${method} ${endpoint}`);
        }
    }

    /**
     * Log de errores de API (sin información sensible)
     * Para errores esperados (401, 400 con mensajes de validación), usar nivel 'info' en lugar de 'warn'
     */
    apiError(endpoint: string, status: number, message: string): void {
        // Errores esperados (validación, autenticación, bloqueo) se muestran como info
        const isExpectedError =
            status === 401 ||
            (status === 400 && (message.includes('registrado') || message.includes('incorrectas'))) ||
            message.includes('bloqueada temporalmente') ||
            message.includes('Cuenta bloqueada');

        if (isExpectedError) {
            // Solo mostrar en debug, no en warn
            if (this.shouldLog('debug')) {
                console.log(`[INFO] API [${status}]: ${endpoint} - ${sanitizeMessage(message)}`);
            }
        } else if (this.shouldLog('warn')) {
            console.warn(`⚠️ API Error [${status}]: ${endpoint} - ${sanitizeMessage(message)}`);
        }
    }

    /**
     * Log de autenticación (sin tokens)
     */
    auth(message: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(`🔐 ${sanitizeMessage(message)}`, ...args);
        }
    }
}

export const logger = new Logger();

// Exportar para uso directo si es necesario
export default logger;

