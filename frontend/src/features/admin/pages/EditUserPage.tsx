'use client';

import { Button } from '@/shared/components';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { UserForm } from '../components/UserForm';

function EditUserPageContent() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.id ? parseInt(params.id as string) : null;

    const handleSuccess = () => {
        router.push('/admin/users');
    };

    if (!userId || isNaN(userId)) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
                    <p className="text-red-700 font-semibold mb-4">ID de usuario no válido</p>
                    <Link href="/admin/users">
                        <Button variant="primary">
                            Volver a Usuarios
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Editar Usuario
                        </h1>
                        <p className="text-gray-700 font-medium mt-1">Modifica la información del usuario</p>
                    </div>
                    <Link href="/admin/users">
                        <Button variant="secondary" size="sm">
                            Volver a Usuarios
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <UserForm userId={userId} onSuccess={handleSuccess} />
            </div>
        </div>
    );
}

export default function EditUserPage() {
    return <EditUserPageContent />;
}

