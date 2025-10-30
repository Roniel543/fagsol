"use client";

import { Footer, Input } from '@/shared/components';
import { AcademyHeader } from '../../academy/components/AcademyHeader';
import { useCart } from '@/shared/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CreditCard, ShieldCheck, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { addEnrollments } from '@/shared/services/enrollment';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
	const { cartItemsWithDetails, total, itemCount, clearCart } = useCart();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const discount = useMemo(() => {
		return cartItemsWithDetails.reduce((sum, item) => {
			if (item.course.discountPrice) {
				return sum + (item.course.price - item.course.discountPrice);
			}
			return sum;
		}, 0);
	}, [cartItemsWithDetails]);

	const [form, setForm] = useState({
		fullName: '',
		email: '',
		country: 'PE',
		phone: '',
	});

	const isValid = form.fullName && /.+@.+\..+/.test(form.email);

	const onConfirm = async () => {
		if (!isValid || loading || itemCount === 0) return;
		setLoading(true);
		try {
			// Mock de pago exitoso + inscripción
			addEnrollments(cartItemsWithDetails.map((i) => i.course.id));
			clearCart();
			router.push('/academy/checkout/success');
		} finally {
			setLoading(false);
		}
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
							<ShieldCheck className="w-4 h-4 text-green-500" /> Pago 100% seguro (mock)
						</div>
					</div>

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
										/>
										<Input
											label="Email"
											type="email"
											name="email"
											value={form.email}
											onChange={(e) => setForm({ ...form, email: e.target.value })}
											placeholder="tucorreo@dominio.com"
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

								<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
									<h2 className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary-orange" /> Pagar con Mercado Pago</h2>
									<p className="mt-1 text-sm text-gray-300">Tarjetas aceptadas: Visa, Mastercard, Amex. (Demo de frontend)</p>
									<div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
										<Smartphone className="w-4 h-4" /> En producción se redirige al Checkout Pro de Mercado Pago.
									</div>
								</div>
							</div>

						</div>

						{/* Columna derecha: resumen */}
						<div className="lg:col-span-1">
							<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 sticky top-6">
								<h3 className="text-lg font-semibold">Resumen del pedido</h3>
								<div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
									{cartItemsWithDetails.map((item) => (
										<div key={item.id} className="flex items-center gap-3">
											<div className="relative w-14 h-14 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
												{item.course.thumbnailUrl ? (
													<Image src={item.course.thumbnailUrl} alt={item.course.title} fill className="object-cover" />
												) : (
													<div className="w-full h-full bg-zinc-800" />
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-sm font-medium line-clamp-2">{item.course.title}</div>
												<div className="text-xs text-gray-400">{item.course.hours}h • {item.course.lessons} lecciones</div>
											</div>
											<div className="text-sm font-semibold text-primary-orange">S/ {item.course.discountPrice || item.course.price}</div>
										</div>
									))}
								</div>

								<div className="mt-4 space-y-2 text-sm">
									<div className="flex items-center justify-between text-gray-400"><span>Subtotal ({itemCount} {itemCount === 1 ? 'curso' : 'cursos'})</span><span>S/ { (total + discount).toFixed(2) }</span></div>
									<div className="flex items-center justify-between text-gray-400"><span>Descuento</span><span className="text-green-500">- S/ {discount.toFixed(2)}</span></div>
									<div className="border-t border-zinc-800 pt-3 flex items-center justify-between text-lg font-bold"><span>Total</span><span className="text-primary-orange">S/ { total.toFixed(2) }</span></div>
								</div>

								<button onClick={onConfirm} disabled={!isValid || loading || itemCount === 0} className={`mt-5 w-full rounded-lg font-semibold py-3 transition-all ${(!isValid || itemCount===0) ? 'bg-zinc-700 text-gray-400 cursor-not-allowed' : 'bg-primary-orange text-primary-black hover:opacity-90 hover:scale-[1.01]'}`}>
									{loading ? 'Procesando...' : 'Pagar con Mercado Pago (demo)'}
								</button>

								<div className="mt-4 text-xs text-gray-400 space-y-1">
									<p>✓ Acceso de por vida</p>
									<p>✓ Certificado de finalización</p>
									<p>✓ Política de reembolso 7 días (mock)</p>
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
