"use client";

import { Footer } from '@/shared/components';
import { AcademyHeader } from '../../academy/components/AcademyHeader';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
	return (
		<>
			<AcademyHeader />
			<main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
				<div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
					<CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
					<h1 className="mt-4 text-2xl sm:text-3xl font-bold">¡Compra confirmada!</h1>
					<p className="mt-2 text-gray-300">Tus cursos ya están disponibles en tu biblioteca.</p>

					<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Link href="/academy/my-courses" className="rounded-lg bg-primary-orange text-primary-black font-semibold py-3 hover:opacity-90">Ver mis cursos</Link>
						<Link href="/academy/catalog" className="rounded-lg border border-zinc-700 bg-zinc-900 text-white font-semibold py-3 hover:border-primary-orange">Explorar más cursos</Link>
					</div>

					<div className="mt-8 text-xs text-gray-400">
						Número de pedido (mock): <span className="text-gray-200">FA-{Math.floor(Math.random()*90000+10000)}</span>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
