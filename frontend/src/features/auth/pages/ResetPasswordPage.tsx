import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

interface ResetPasswordPageProps {
    params: {
        uid: string;
        token: string;
    };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
    return <ResetPasswordForm uid={params.uid} token={params.token} />;
}

