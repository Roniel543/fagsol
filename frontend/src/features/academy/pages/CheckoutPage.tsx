"use client";

import { Footer, Input, ProtectedRoute, useToast } from '@/shared/components';
import { useCart } from '@/shared/contexts/CartContext';
import { createPaymentIntent, PaymentIntent, processPayment } from '@/shared/services/payments';
import { AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AcademyHeader } from '../../academy/components/AcademyHeader';
import { MercadoPagoCardForm } from '../components/payments/MercadoPagoCardForm';

function CheckoutPageContent() {
	const { cartItems, cartItemsWithDetails, itemCount, clearCart } = useCart();
	const router = useRouter();
	const { showToast } = useToast();

	// Estados del payment intent (del backend)
	const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
	const [loadingIntent, setLoadingIntent] = useState(false);
	const [processingPayment, setProcessingPayment] = useState(false);
	const [paymentToken, setPaymentToken] = useState<string | null>(null);
	const [expirationMonth, setExpirationMonth] = useState<string | null>(null);
	const [expirationYear, setExpirationYear] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

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

	// Crear payment intent al cargar (si hay items en el carrito)
	useEffect(() => {
		if (itemCount === 0) {
			router.push('/academy/cart');
			return;
		}

		// Crear payment intent con el backend
		const createIntent = async () => {
			setLoadingIntent(true);
			setError(null);

			try {
				const courseIds = cartItems.map(item => item.id);
				const response = await createPaymentIntent(courseIds);

				if (response.success && response.data) {
					setPaymentIntent(response.data);
				} else {
					setError(response.message || 'Error al crear la intención de pago');
					showToast(response.message || 'Error al crear la intención de pago', 'error');
				}
			} catch (err) {
				const errorMessage = 'Error de conexión con el servidor';
				setError(errorMessage);
				showToast(errorMessage, 'error');
			} finally {
				setLoadingIntent(false);
			}
		};

		createIntent();
	}, [cartItems, itemCount, router, showToast]);

	// Procesar pago cuando se obtiene el token
	useEffect(() => {
		if (!paymentToken || !paymentIntent || !expirationMonth || !expirationYear) return;

		const process = async () => {
			setProcessingPayment(true);
			setError(null);

			try {
				const response = await processPayment(paymentIntent.id, paymentToken, expirationMonth, expirationYear);

				if (response.success) {
					showToast('¡Pago procesado exitosamente!', 'success');
					clearCart();
					router.push('/academy/checkout/success');
				} else {
					setError(response.message || 'Error al procesar el pago');
					showToast(response.message || 'Error al procesar el pago', 'error');
					setPaymentToken(null); // Reset para reintentar
				}
			} catch (err) {
				const errorMessage = 'Error de conexión con el servidor';
				setError(errorMessage);
				showToast(errorMessage, 'error');
				setPaymentToken(null);
			} finally {
				setProcessingPayment(false);
			}
		};

		process();
	}, [paymentToken, paymentIntent, expirationMonth, expirationYear, clearCart, router, showToast]);

	// Handler cuando Mercado Pago tokeniza la tarjeta
	const handleTokenReady = (token: string, expMonth: string, expYear: string) => {
		setPaymentToken(token);
		setExpirationMonth(expMonth);
		setExpirationYear(expYear);
	};

	const handlePaymentError = (errorMessage: string) => {
		setError(errorMessage);
		showToast(errorMessage, 'error');
	};

	return (
		<>
			<AcademyHeader />
			<main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
				<div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
					<div className="flex items-center justify-between">
						<Link href="/academy/cart" className="text-primary-orange inline-flex items-center gap-2 text-sm hover:underline">
							<ArrowLeft className="w-4 h-4" /> Volver al carrito
						</Link>
						<div className="text-xs text-gray-400 flex items-center gap-2">
							<ShieldCheck className="w-4 h-4 text-green-500" /> Pago 100% seguro
						</div>
					</div>

					{error && (
						<div className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-red-400 font-medium">Error</p>
								<p className="text-red-300 text-sm mt-1">{error}</p>
							</div>
						</div>
					)}

					<div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Columna izquierda: formulario */}
						<div className="lg:col-span-2">
							<h1 className="text-2xl sm:text-3xl font-bold">Checkout</h1>

							<div className="mt-6 space-y-5">
								<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
									<h2 className="font-semibold">Datos de contacto</h2>
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
									<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
										<div className="flex items-center justify-center py-8">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
											<span className="ml-3 text-gray-300">Validando cursos y calculando total...</span>
										</div>
									</div>
								) : paymentIntent ? (
									<MercadoPagoCardForm
										publicKey={mercadoPagoPublicKey}
										amount={paymentIntent.total}
										onTokenReady={handleTokenReady}
										onError={handlePaymentError}
										disabled={!isValid || processingPayment}
									/>
								) : (
									<div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
										No se pudo crear la intención de pago. Por favor, intenta nuevamente.
									</div>
								)}
							</div>

						</div>

						{/* Columna derecha: resumen */}
						<div className="lg:col-span-1">
							<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sticky top-6">
								<h3 className="text-lg font-semibold">Resumen del pedido</h3>

								{loadingIntent ? (
									<div className="mt-4 flex items-center justify-center py-8">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-orange"></div>
										<span className="ml-2 text-sm text-gray-400">Cargando...</span>
									</div>
								) : paymentIntent ? (
									<>
										<div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
											{paymentIntent.items.map((item) => {
												const cartItem = cartItemsWithDetails.find(ci => ci.course.id === item.course_id);
												return (
													<div key={item.course_id} className="flex items-center gap-3">
														<div className="relative w-14 h-14 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
															{cartItem?.course.thumbnailUrl ? (
																<Image src={cartItem.course.thumbnailUrl} alt={item.course_title} fill className="object-cover" />
															) : (
																<div className="w-full h-full bg-zinc-800" />
															)}
														</div>
														<div className="flex-1 min-w-0">
															<div className="text-sm font-medium line-clamp-2">{item.course_title}</div>
															<div className="text-xs text-gray-400">
																{cartItem?.course.hours || 0}h • {cartItem?.course.lessons || 0} lecciones
															</div>
														</div>
														<div className="text-sm font-semibold text-primary-orange">S/ {item.price.toFixed(2)}</div>
													</div>
												);
											})}
										</div>

										<div className="mt-4 space-y-2 text-sm">
											<div className="flex items-center justify-between text-gray-400">
												<span>Subtotal ({itemCount} {itemCount === 1 ? 'curso' : 'cursos'})</span>
												<span>S/ {paymentIntent.total.toFixed(2)}</span>
											</div>
											<div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-lg font-bold">
												<span>Total</span>
												<span className="text-primary-orange">S/ {paymentIntent.total.toFixed(2)}</span>
											</div>
										</div>

										{processingPayment && (
											<div className="mt-4 p-3 bg-primary-orange/10 border border-primary-orange/30 rounded-lg">
												<div className="flex items-center gap-2 text-primary-orange text-sm">
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-orange"></div>
													<span>Procesando pago...</span>
												</div>
											</div>
										)}
									</>
								) : (
									<div className="mt-4 text-sm text-gray-400">
										No se pudo cargar el resumen del pedido.
									</div>
								)}

								<div className="mt-4 text-xs text-gray-400 space-y-1">
									<p>✓ Acceso de por vida</p>
									<p>✓ Certificado de finalización</p>
									<p>✓ Política de reembolso 7 días</p>
									<p className="mt-2 text-gray-500">* El total es calculado y validado por el servidor</p>
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
