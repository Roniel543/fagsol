"use client";

import { Footer, Input, MultiCurrencyPrice, ProtectedRoute, useToast } from '@/shared/components';
import { useCart } from '@/shared/contexts/CartContext';
import { createPaymentIntent, PaymentIntent, processPayment } from '@/shared/services/payments';
import { formatErrorForLogging, mapErrorToUserMessage } from '@/shared/utils/errorMapper';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AcademyHeader } from '../../academy/components/AcademyHeader';

// Generar UUID simple para idempotency
function generateIdempotencyKey(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback para navegadores que no soportan crypto.randomUUID
	return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Tipos para Mercado Pago Bricks
interface MercadoPagoBricks {
	bricks: {
		create: (brickType: string, containerId: string, settings: any) => any;
	};
}

declare global {
	interface Window {
		MercadoPago: any;
	}
}

function CheckoutPageContent() {
	const { cartItems, cartItemsWithDetails, itemCount, clearCart } = useCart();
	const router = useRouter();
	const { showToast } = useToast();

	// Constante para tasa de conversión USD → PEN
	const DEFAULT_USD_TO_PEN_RATE = 3.75;

	// Estados del payment intent (del backend)
	const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
	const [loadingIntent, setLoadingIntent] = useState(false);
	const [processingPayment, setProcessingPayment] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [brickInstance, setBrickInstance] = useState<any>(null);
	const [isBrickReady, setIsBrickReady] = useState(false);

	// Referencias
	const brickContainerRef = useRef<HTMLDivElement>(null);
	const scriptLoadedRef = useRef(false);

	// Datos de contacto
	const [form, setForm] = useState({
		fullName: '',
		email: '',
		country: 'PE',
		phone: '',
	});

	const isValid = form.fullName && /.+@.+\..+/.test(form.email);

	// Obtener public key de Mercado Pago desde variables de entorno
	const mercadoPagoPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

	// Verificar si el SDK de Mercado Pago ya está cargado (pre-cargado desde layout)
	useEffect(() => {
		if (!mercadoPagoPublicKey) {
			return;
		}

		// Verificar si el SDK ya está disponible
		const checkSDK = () => {
			if (typeof window !== 'undefined' && window.MercadoPago) {
				scriptLoadedRef.current = true;
				setIsBrickReady(true);
				return true;
			}
			return false;
		};

		// Verificar inmediatamente
		if (checkSDK()) {
			return;
		}

		// Si no está disponible, esperar a que se cargue (máximo 5 segundos)
		let attempts = 0;
		const maxAttempts = 50; // 50 intentos * 100ms = 5 segundos máximo
		const interval = setInterval(() => {
			attempts++;
			if (checkSDK() || attempts >= maxAttempts) {
				clearInterval(interval);
				if (attempts >= maxAttempts && !window.MercadoPago) {
					setError('Error al cargar el SDK de Mercado Pago. Verifica tu conexión a internet.');
				}
			}
		}, 100);

		return () => clearInterval(interval);
	}, [mercadoPagoPublicKey]);

	// Inicializar CardPayment Brick cuando esté listo
	useEffect(() => {
		if (!isBrickReady || !paymentIntent || !brickContainerRef.current || !mercadoPagoPublicKey) {
			return;
		}

		try {
			const mp = new window.MercadoPago(mercadoPagoPublicKey, {
				locale: 'es-PE',
				// Configuración adicional para mejor compatibilidad con formato de fecha
			});

			// Limpiar contenedor antes de crear el brick
			if (brickContainerRef.current) {
				brickContainerRef.current.innerHTML = '';
			}

			const cardPaymentBrickController = mp.bricks().create('cardPayment', 'paymentBrick_container', {
				initialization: {
					amount: paymentIntent.total,
					payer: {
						email: form.email || undefined,
					},
				},
				callbacks: {
					onReady: () => {
						console.log('CardPayment Brick ready');
						setBrickInstance(cardPaymentBrickController);
					},
					onError: (error: any) => {
						console.error('CardPayment Brick error:', formatErrorForLogging(error, 'CardPayment'));
						// Log detallado para debugging del formato de fecha
						if (error?.field === 'cardExpirationDate' || error?.message?.toLowerCase().includes('expiration') || error?.message?.toLowerCase().includes('vencimiento')) {
							console.warn('Error en campo de vencimiento:', {
								error,
								field: error?.field,
								message: error?.message,
								code: error?.code,
							});
						}
						const errorMapping = mapErrorToUserMessage(error, 'payment');
						setError(errorMapping.userMessage);
						showToast(errorMapping.userMessage, 'error');
					},
					onFieldChange: (field: any) => {
						// Callback para detectar cambios en los campos y ayudar con debugging
						if (field.field === 'cardExpirationDate') {
							console.log('Campo de vencimiento cambiado:', {
								value: field.value,
								error: field.error,
								field: field.field,
							});
						}
					},
					onSubmit: async (formData: any) => {
						// Prevenir múltiples submits
						if (processingPayment) {
							return;
						}

						setProcessingPayment(true);
						setError(null);

						try {
							// Obtener datos del formulario
							const { token, payment_method_id, installments } = formData;

							if (!token) {
								throw new Error('No se pudo obtener el token de la tarjeta');
							}

							// Generar idempotency key
							const idempotencyKey = generateIdempotencyKey();

							// Procesar pago con el backend
							const response = await processPayment(
								paymentIntent.id,
								token,
								payment_method_id || 'visa',
								installments || 1,
								paymentIntent.total,
								idempotencyKey
							);

							if (response.success && response.data) {
								showToast('¡Pago procesado exitosamente!', 'success');
								clearCart();
								router.push('/academy/checkout/success');
							} else {
								const errorMapping = mapErrorToUserMessage(response, 'payment');
								console.error('Payment processing error:', formatErrorForLogging(response, 'Payment'));
								setError(errorMapping.userMessage);
								showToast(errorMapping.userMessage, 'error');
							}
						} catch (err: any) {
							console.error('Error processing payment:', formatErrorForLogging(err, 'Payment'));
							const errorMapping = mapErrorToUserMessage(err, 'payment');
							setError(errorMapping.userMessage);
							showToast(errorMapping.userMessage, 'error');
						} finally {
							setProcessingPayment(false);
						}
					},
				},
				customization: {
					visual: {
						style: {
							theme: 'dark',
							customVariables: {
								baseColor: '#F5A623', // primary-orange del sistema de diseño
								baseColorFirstVariant: '#F5A623',
								baseColorSecondVariant: '#F5A623',
								errorColor: '#FF6B6B', // status-error
								successColor: '#2D9B7F', // status-success
								outlinePrimaryColor: '#F5A623',
								outlineSecondaryColor: '#282828', // secondary-medium-gray
								// Nota: borderRadius y fontFamily no son propiedades válidas en customVariables
								// según la documentación de Mercado Pago Bricks
							},
						},
						texts: {
							fontType: 'custom',
							// La personalización de fuente se puede hacer mediante CSS externo si es necesario
						},
					},
					// Configuración de campos para mejorar validación
					fields: {
						cardholderName: {
							placeholder: 'Nombre del titular',
						},
						cardholderIdentificationType: {
							placeholder: 'Tipo de documento',
						},
						cardholderIdentificationNumber: {
							placeholder: 'Número de documento',
						},
						cardExpirationDate: {
							placeholder: 'MM/AA',
							// El formato debe ser MM/YY donde MM es mes (01-12) y YY es año (2 dígitos)
							// IMPORTANTE: La fecha debe estar al menos un año en el futuro
							// Ejemplo válido (si estamos en enero 2025): 11/26 (noviembre 2026)
							// Ejemplo inválido: 11/25 (muy cercano, será rechazado)
						},
						cardNumber: {
							placeholder: 'Número de tarjeta',
						},
						securityCode: {
							placeholder: 'CVV',
						},
					},
				},
			});

			return () => {
				// Cleanup: el brick se destruye automáticamente cuando se desmonta el componente
			};
		} catch (err: any) {
			console.error('Error initializing CardPayment Brick:', formatErrorForLogging(err, 'BrickInit'));
			const errorMapping = mapErrorToUserMessage(err, 'payment');
			setError(errorMapping.userMessage);
			showToast(errorMapping.userMessage, 'error');
		}
	}, [isBrickReady, paymentIntent, mercadoPagoPublicKey, form.email, processingPayment, clearCart, router, showToast]);

	// Crear payment intent al cargar (paralelo con la carga del SDK)
	useEffect(() => {
		if (itemCount === 0) {
			router.push('/academy/cart');
			return;
		}

		// Crear payment intent con el backend (no espera al SDK)
		const createIntent = async () => {
			setLoadingIntent(true);
			setError(null);

			try {
				const courseIds = cartItems.map(item => item.id);
				const response = await createPaymentIntent(courseIds);

				if (response.success && response.data) {
					setPaymentIntent(response.data);
				} else {
					const errorMapping = mapErrorToUserMessage(response, 'payment');
					console.error('Payment intent creation error:', formatErrorForLogging(response, 'PaymentIntent'));
					setError(errorMapping.userMessage);
					showToast(errorMapping.userMessage, 'error');
				}
			} catch (err) {
				console.error('Payment intent error:', formatErrorForLogging(err, 'PaymentIntent'));
				const errorMapping = mapErrorToUserMessage(err, 'payment');
				setError(errorMapping.userMessage);
				showToast(errorMapping.userMessage, 'error');
			} finally {
				setLoadingIntent(false);
			}
		};

		createIntent();
	}, [cartItems, itemCount, router, showToast]);

	if (!mercadoPagoPublicKey) {
		return (
			<>
				<AcademyHeader />
				<main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
					<div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
						<div className="rounded-xl border border-status-error/50 bg-status-error/10 p-6 text-status-error">
							Clave pública de Mercado Pago no configurada. Configura NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
						</div>
					</div>
				</main>
			</>
		);
	}

	return (
		<>
			<AcademyHeader />
			<main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
				<div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
					<div className="flex items-center justify-between">
						<Link href="/academy/cart" className="text-primary-orange inline-flex items-center gap-2 text-sm hover:text-primary-orange/80 transition-colors">
							<ArrowLeft className="w-4 h-4" /> Volver al carrito
						</Link>
						<div className="text-xs text-secondary-light-gray flex items-center gap-2">
							<ShieldCheck className="w-4 h-4 text-status-success" /> Pago 100% seguro
						</div>
					</div>

					{error && (
						<div className="mt-4 rounded-xl border border-status-error/50 bg-status-error/10 p-4 flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-status-error font-medium">Error</p>
								<p className="text-status-error/80 text-sm mt-1">{error}</p>
							</div>
						</div>
					)}

					<div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Columna izquierda: formulario */}
						<div className="lg:col-span-2">
							<h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>

							<div className="mt-6 space-y-5">
								<div className="rounded-xl border border-secondary-medium-gray bg-secondary-dark-gray/60 p-6">
									<h2 className="font-semibold text-primary-white">Datos de contacto</h2>
									<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
										<Input
											label="Nombre completo"
											name="fullName"
											value={form.fullName}
											onChange={(e) => setForm({ ...form, fullName: e.target.value })}
											placeholder="Tu nombre y apellidos"
											className="col-span-2"
											required
										/>
										<Input
											label="Email"
											type="email"
											name="email"
											value={form.email}
											onChange={(e) => setForm({ ...form, email: e.target.value })}
											placeholder="tucorreo@dominio.com"
											required
										/>
										<Input
											label="Teléfono (opcional)"
											name="phone"
											value={form.phone}
											onChange={(e) => setForm({ ...form, phone: e.target.value })}
											placeholder="+51 999 999 999"
										/>
									</div>
								</div>

								{loadingIntent ? (
									<div className="rounded-xl border border-secondary-medium-gray bg-secondary-dark-gray/60 p-6">
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
											<span className="ml-3 text-secondary-light-gray">Validando cursos y calculando total...</span>
										</div>
									</div>
								) : paymentIntent ? (
									<div className="rounded-xl border border-secondary-medium-gray bg-secondary-dark-gray/60 p-6">
										<h2 className="font-semibold mb-4 text-primary-white">Pagar con Mercado Pago</h2>
										{!isValid && (
											<div className="mb-4 p-3 bg-status-warning/10 border border-status-warning/30 rounded-lg text-status-warning text-sm">
												Completa los datos de contacto primero
											</div>
										)}
										{isValid && (
											<div id="paymentBrick_container" ref={brickContainerRef} className="min-h-[400px]">
												{!isBrickReady && (
													<div className="flex items-center justify-center py-8">
														<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
														<span className="ml-3 text-secondary-light-gray">Cargando formulario de pago...</span>
													</div>
												)}
											</div>
										)}
										{processingPayment && (
											<div className="mt-4 p-3 bg-primary-orange/10 border border-primary-orange/30 rounded-lg">
												<div className="flex items-center gap-2 text-primary-orange text-sm">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-orange"></div>
													<span>Procesando pago...</span>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className="rounded-xl border border-status-error/50 bg-status-error/10 p-6 text-status-error">
										No se pudo crear la intención de pago. Por favor, intenta nuevamente.
									</div>
								)}
							</div>
						</div>

						{/* Columna derecha: resumen */}
						<div className="lg:col-span-1">
							<div className="rounded-xl border border-secondary-medium-gray bg-secondary-dark-gray/60 p-6 sticky top-6">
								<h3 className="text-lg font-semibold text-primary-white">Resumen del pedido</h3>

								{loadingIntent ? (
									<div className="mt-4 flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-orange"></div>
										<span className="ml-2 text-sm text-secondary-light-gray">Cargando...</span>
									</div>
								) : paymentIntent ? (
									<>
										<div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-hide">
											{paymentIntent.items.map((item) => {
												const cartItem = cartItemsWithDetails.find(ci => ci.course.id === item.course_id);
												// Convertir precio PEN a USD (el item.price viene en PEN del backend)
												const priceUsd = cartItem?.course.price_usd || item.price / DEFAULT_USD_TO_PEN_RATE;
												return (
													<div key={item.course_id} className="flex items-center gap-3">
														<div className="relative w-14 h-14 rounded-md overflow-hidden bg-secondary-medium-gray flex-shrink-0">
															{cartItem?.course.thumbnailUrl ? (
																<Image src={cartItem.course.thumbnailUrl} alt={item.course_title} fill className="object-cover" />
															) : (
																<div className="w-full h-full bg-secondary-medium-gray" />
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="text-sm font-medium line-clamp-2 text-primary-white">{item.course_title}</div>
															<div className="text-xs text-secondary-light-gray">
																{cartItem?.course.hours || 0}h • {cartItem?.course.lessons || 0} lecciones
															</div>
														</div>
														<div className="text-right">
															<MultiCurrencyPrice
																priceUsd={priceUsd}
																pricePen={item.price}
																size="sm"
																showUsd={false}
															/>
														</div>
													</div>
												);
											})}
										</div>

										<div className="mt-4 space-y-2 text-sm">
											<div className="flex items-center justify-between text-secondary-light-gray">
												<span>Subtotal ({itemCount} {itemCount === 1 ? 'curso' : 'cursos'})</span>
												<div className="text-right">
													<MultiCurrencyPrice
														priceUsd={paymentIntent.total / DEFAULT_USD_TO_PEN_RATE}
														pricePen={paymentIntent.total}
														size="sm"
														showUsd={false}
													/>
												</div>
											</div>
											<div className="border-t border-secondary-medium-gray pt-3 flex items-center justify-between">
												<span className="text-lg font-bold text-primary-white">Total</span>
												<div className="text-right">
													<MultiCurrencyPrice
														priceUsd={paymentIntent.total / DEFAULT_USD_TO_PEN_RATE}
														pricePen={paymentIntent.total}
														size="lg"
														showUsd={true}
													/>
												</div>
											</div>
											<p className="mt-2 text-xs text-secondary-light-gray/70">
												* El pago se procesará en PEN según la tasa de cambio actual
											</p>
										</div>
									</>
								) : (
									<div className="mt-4 text-sm text-secondary-light-gray">
										No se pudo cargar el resumen del pedido.
									</div>
								)}

								<div className="mt-4 text-xs text-secondary-light-gray space-y-1">
									<p className="flex items-center gap-1">
										<span className="text-status-success">✓</span> Acceso de por vida
									</p>
									<p className="flex items-center gap-1">
										<span className="text-status-success">✓</span> Certificado de finalización
									</p>
									<p className="flex items-center gap-1">
										<span className="text-status-success">✓</span> Política de reembolso 7 días
									</p>
									<p className="mt-2 text-secondary-light-gray/70">* El total es calculado y validado por el servidor</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}

// Componente principal que envuelve con ProtectedRoute
export default function CheckoutPage() {
	return (
		<ProtectedRoute redirectTo="/auth/login?redirect=/academy/checkout">
			<CheckoutPageContent />
		</ProtectedRoute>
	);
}
