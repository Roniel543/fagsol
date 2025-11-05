export type PaymentMethod = 'card' | 'mercado_pago' | 'wallet';

export type PaymentIntentStatus = 'idle' | 'creating' | 'requires_action' | 'redirect' | 'succeeded' | 'failed';

export interface CreatePaymentParams {
	amount: number;
	currency: string;
	items: { id: string; title: string; unitPrice: number; quantity: number }[];
	customer?: { name?: string; email?: string; phone?: string };
	metadata?: Record<string, string>;
}

export interface PaymentProvider {
	name: string;
	// Fase 1: Checkout Pro / Redirect (MP, Stripe Checkout)
	createRedirectCheckout: (params: CreatePaymentParams) => Promise<{ url: string }>;
	// Fase 2: Card Bricks/Elements (hosted fields) → requiere backend para tokenización
	createCardPaymentIntent?: (params: CreatePaymentParams) => Promise<{ clientSecret: string }>;
}
