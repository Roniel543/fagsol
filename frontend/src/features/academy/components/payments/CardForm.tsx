'use client';

import { useState } from 'react';

type Props = {
	onValidChange?: (valid: boolean) => void;
};

export function CardForm({ onValidChange }: Props) {
	const [card, setCard] = useState({
		number: '',
		name: '',
		exp: '',
		cvv: '',
	});

	const isValid =
		/^[0-9 ]{12,19}$/.test(card.number) &&
		card.name.trim().length > 3 &&
		/^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.exp) &&
		/^\d{3,4}$/.test(card.cvv);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			<input
				className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange"
				placeholder="Número de tarjeta (mock)"
				value={card.number}
				onChange={(e) => {
					setCard({ ...card, number: e.target.value });
					onValidChange?.(isValid);
				}}
			/>
			<input
				className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange"
				placeholder="Nombre en la tarjeta"
				value={card.name}
				onChange={(e) => {
					setCard({ ...card, name: e.target.value });
					onValidChange?.(isValid);
				}}
			/>
			<input
				className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange"
				placeholder="MM/YY"
				value={card.exp}
				onChange={(e) => {
					setCard({ ...card, exp: e.target.value });
					onValidChange?.(isValid);
				}}
			/>
			<input
				className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange"
				placeholder="CVV"
				value={card.cvv}
				onChange={(e) => {
					setCard({ ...card, cvv: e.target.value });
					onValidChange?.(isValid);
				}}
			/>
			<p className="col-span-2 text-xs text-gray-500">
				Demo: estos campos son decorativos. En producción usaremos Hosted Fields (Bricks/Elements) del PSP para cumplir PCI.
			</p>
		</div>
	);
}

export default CardForm;
