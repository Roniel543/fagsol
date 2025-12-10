import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

interface PageProps {
    params: {
        uid: string;
        token: string;
    };
}

export default function Page({ params }: PageProps) {
    return <ResetPasswordPage params={params} />;
}

