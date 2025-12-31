'use client';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';

type Params = {
    uid: string;
    token: string;
};

export default async function Page({ params }: { params: Promise<Params> }) {
    const resolvedParams = await params;
    return <ResetPasswordPage params={resolvedParams} />;
}

