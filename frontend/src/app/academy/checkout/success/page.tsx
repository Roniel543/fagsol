import dynamic from 'next/dynamic';

const CheckoutSuccessPage = dynamic(() => import('@/features/academy/pages/CheckoutSuccessPage'), { ssr: false });

export default function Page() {
	return <CheckoutSuccessPage />;
}
