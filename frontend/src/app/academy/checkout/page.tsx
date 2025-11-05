import dynamic from 'next/dynamic';

const CheckoutPage = dynamic(() => import('@/features/academy/pages/CheckoutPage'), { ssr: false });

export default function Page() {
	return <CheckoutPage />;
}
