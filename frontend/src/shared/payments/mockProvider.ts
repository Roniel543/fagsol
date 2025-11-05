import { CreatePaymentParams, PaymentProvider } from './types';

export const MockPaymentProvider: PaymentProvider = {
	name: 'mock',
	async createRedirectCheckout(params: CreatePaymentParams) {
		// Simula crear una preferencia/checkout y devolver URL de redirección
		await new Promise((r) => setTimeout(r, 600));
		return { url: '/academy/checkout/success' };
	},
};
