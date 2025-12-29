'use client';

import { useEffect } from 'react';

/**
 * Componente para manejar errores globales y silenciar errores de extensiones del navegador
 * como MetaMask que no son relevantes para nuestra aplicación
 */
export function ErrorHandler() {
    useEffect(() => {
        // Lista de errores que queremos silenciar (vienen de extensiones del navegador)
        const ignoredErrors = [
            'Failed to connect to MetaMask',
            'MetaMask extension not found',
            'MetaMask',
            'chrome-extension://',
        ];

        // Función para verificar si un error debe ser ignorado
        const shouldIgnoreError = (error: Error | string): boolean => {
            const errorMessage = typeof error === 'string' ? error : error.message;
            const errorStack = typeof error === 'string' ? '' : error.stack || '';

            return ignoredErrors.some(ignored =>
                errorMessage.includes(ignored) || errorStack.includes(ignored)
            );
        };

        // Manejador de errores no capturados
        const handleError = (event: ErrorEvent) => {
            const error = event.error || event.message;

            if (shouldIgnoreError(error)) {
                // Prevenir que el error se propague al overlay de Next.js
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        // Manejador de promesas rechazadas no capturadas
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason;

            // Convertir el reason a string si es un objeto Error
            let errorString = '';
            if (reason instanceof Error) {
                errorString = reason.message + ' ' + (reason.stack || '');
            } else if (typeof reason === 'string') {
                errorString = reason;
            } else {
                errorString = String(reason);
            }

            if (shouldIgnoreError(errorString)) {
                // Prevenir que el error se propague al overlay de Next.js
                event.preventDefault();
                // También silenciar en la consola (opcional, solo en desarrollo)
                if (process.env.NODE_ENV === 'development') {
                    console.debug('[ErrorHandler] Silenciado error de extensión:', errorString);
                }
                return false;
            }
        };

        // Registrar los manejadores
        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    // Este componente no renderiza nada
    return null;
}

