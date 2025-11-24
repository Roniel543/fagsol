'use client';

import { Button, Card } from '@/shared/components';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MaterialForm } from '../components/MaterialForm';

function CreateMaterialPageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const handleSuccess = () => {
        router.push(`/admin/courses/${courseId}/materials`);
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
                            Agregar Material
                        </h1>
                        <p className="text-gray-600 mt-1">Agrega un material complementario al curso (video Vimeo o enlace)</p>
                    </div>
                    <Link href={`/admin/courses/${courseId}/materials`}>
                        <Button variant="secondary" size="sm">
                            Volver a Materiales
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <Card className="p-8">
                <MaterialForm courseId={courseId} onSuccess={handleSuccess} />
            </Card>
        </div>
    );
}

export default function CreateMaterialPage() {
    return <CreateMaterialPageContent />;
}

