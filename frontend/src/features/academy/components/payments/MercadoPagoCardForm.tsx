'use client';

import { CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MercadoPagoCardFormProps {
    publicKey: string;
    onTokenReady: (token: string) => void;
    onError: (error: string) => void;
    amount: number;
    disabled?: boolean;
}

/**
 * Componente seguro de formulario de tarjeta usando Mercado Pago
 * 
 * IMPORTANTE:
 * - Tokeniza tarjetas client-side (cumple PCI DSS)
 * - NO envía datos de tarjeta al backend
 * - Solo envía el token de Mercado Pago
 * 
 * NOTA: Este componente usa la API de Mercado Pago directamente.
 * En producción, se recomienda usar Mercado Pago Bricks o Elements para cumplir PCI DSS completamente.
 */
export function MercadoPagoCardForm({
    publicKey,
    onTokenReady,
    onError,
    amount,
    disabled = false,
}: MercadoPagoCardFormProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardholderName: '',
        expirationDate: '',
        securityCode: '',
    });
    const scriptLoaded = useRef(false);

    // Cargar script de Mercado Pago
    useEffect(() => {
        if (scriptLoaded.current || !publicKey) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = () => {
            scriptLoaded.current = true;
            setIsInitialized(true);
        };
        script.onerror = () => {
            onError('Error al cargar el SDK de Mercado Pago');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup si es necesario
        };
    }, [publicKey, onError]);

    // Tokenizar tarjeta con Mercado Pago
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (disabled || isProcessing) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Validar datos básicos
            if (!cardData.cardNumber || !cardData.cardholderName || !cardData.expirationDate || !cardData.securityCode) {
                throw new Error('Por favor completa todos los campos de la tarjeta');
            }

            // Usar Mercado Pago SDK para tokenizar
            // NOTA: En producción, esto debe hacerse con Bricks/Elements
            if (typeof window !== 'undefined' && (window as any).MercadoPago) {
                const mp = new (window as any).MercadoPago(publicKey, {
                    locale: 'es-PE'
                });

                // Limpiar número de tarjeta
                const cardNumber = cardData.cardNumber.replace(/\s/g, '');
                const [expMonth, expYear] = cardData.expirationDate.split('/');

                // Crear token (esto es un ejemplo - en producción usar Bricks)
                const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${publicKey}`,
                    },
                    body: JSON.stringify({
                        card_number: cardNumber,
                        cardholder: {
                            name: cardData.cardholderName,
                        },
                        card_expiration_month: expMonth,
                        card_expiration_year: '20' + expYear,
                        security_code: cardData.securityCode,
                        identification_type: 'DNI',
                        identification_number: '12345678', // En producción, obtener del usuario
                    }),
                });

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json();
                    throw new Error(errorData.message || 'Error al tokenizar la tarjeta');
                }

                const tokenData = await tokenResponse.json();
                if (tokenData.id) {
                    onTokenReady(tokenData.id);
                } else {
                    throw new Error('No se pudo generar el token');
                }
            } else {
                throw new Error('SDK de Mercado Pago no disponible. Recarga la página.');
            }
        } catch (err: any) {
            console.error('Error tokenizing card:', err);
            const errorMessage = err?.message || 'Error al procesar la tarjeta';
            setError(errorMessage);
            onError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!publicKey) {
        return (
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-red-400 text-sm">
                ⚠️ Clave pública de Mercado Pago no configurada. Configura NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
            </div>
        );
    }

    if (disabled) {
        return (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                <div className="flex items-center gap-2 text-gray-400">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Completa los datos de contacto primero</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary-orange" />
                Pagar con Mercado Pago
            </h2>
            <p className="text-sm text-gray-300 mb-4">
                Tarjetas aceptadas: Visa, Mastercard, Amex, Diners Club
            </p>

            {!isInitialized ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-orange" />
                    <span className="ml-2 text-sm text-gray-400">Cargando formulario de pago...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Número de tarjeta
                        </label>
                        <input
                            type="text"
                            value={cardData.cardNumber}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setCardData({ ...cardData, cardNumber: value });
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange focus:outline-none text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Nombre en la tarjeta
                        </label>
                        <input
                            type="text"
                            value={cardData.cardholderName}
                            onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
                            placeholder="JUAN PEREZ"
                            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange focus:outline-none text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Vencimiento
                            </label>
                            <input
                                type="text"
                                value={cardData.expirationDate}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
                                    setCardData({ ...cardData, expirationDate: value });
                                }}
                                placeholder="MM/AA"
                                maxLength={5}
                                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange focus:outline-none text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                CVV
                            </label>
                            <input
                                type="text"
                                value={cardData.securityCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setCardData({ ...cardData, securityCode: value });
                                }}
                                placeholder="123"
                                maxLength={4}
                                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange focus:outline-none text-white"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={isProcessing || disabled}
                        className={`w-full rounded-lg font-semibold py-3 transition-all ${isProcessing || disabled
                            ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-orange text-primary-black hover:opacity-90'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando...
                            </span>
                        ) : (
                            `Pagar S/ ${amount.toFixed(2)}`
                        )}
                    </button>
                </form>
            )}

            <div className="mt-4 text-xs text-gray-400 space-y-1">
                <p>🔒 Tus datos están protegidos. No almacenamos información de tu tarjeta.</p>
                <p>✅ Tokenización segura mediante Mercado Pago</p>
                <p className="text-gray-500 mt-2">
                    ⚠️ NOTA: En producción, usar Mercado Pago Bricks/Elements para cumplir PCI DSS completamente
                </p>
            </div>
        </div>
    );
}
