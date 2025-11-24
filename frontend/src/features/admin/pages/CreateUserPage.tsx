'use client';

import { Button, Card } from '@/shared/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserForm } from '../components/UserForm';

function CreateUserPageContent() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/admin/users');
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Crear Nuevo Usuario
                        </h1>
                        <p className="text-gray-600 mt-1">Completa el formulario para crear un nuevo usuario</p>
                    </div>
                    <Link href="/admin/users">
                        <Button variant="secondary" size="sm">
                            Volver a Usuarios
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <Card className="p-8">
                <UserForm onSuccess={handleSuccess} />
            </Card>
        </div>
    );
}

export default function CreateUserPage() {
    return <CreateUserPageContent />;
}

