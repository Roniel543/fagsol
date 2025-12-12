'use client';

import { Button, Card } from '@/shared/components';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ModuleForm } from '../components/ModuleForm';

function CreateModulePageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const handleSuccess = () => {
        router.push(`/admin/courses/${courseId}/modules`);
    };

    if (!courseId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">ID de curso no válido</p>
                    <Link href="/admin/courses">
                        <Button variant="primary">Volver a Cursos</Button>
                    </Link>
                </Card>
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
                            Crear Nuevo Módulo
                        </h1>
                        <p className="text-gray-700 font-medium mt-1">Completa el formulario para crear un nuevo módulo</p>
                    </div>
                    <Link href={`/admin/courses/${courseId}/modules`}>
                        <Button variant="secondary" size="sm">
                            Volver a Módulos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
                <ModuleForm courseId={courseId} onSuccess={handleSuccess} />
            </div>
        </div>
    );
}

export default function CreateModulePage() {
    return <CreateModulePageContent />;
}

