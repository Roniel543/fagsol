'use client';

import { Button } from '@/shared/components';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { MaterialForm } from '../components/MaterialForm';

function EditMaterialPageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;
    const materialId = params?.materialId as string;

    const handleSuccess = () => {
        router.push(`/admin/courses/${courseId}/materials`);
    };

    if (!courseId || !materialId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                    <p className="text-red-600 mb-4 font-medium">ID de curso o material no válido</p>
                    <Link href="/admin/courses">
                        <Button variant="primary">Volver a Cursos</Button>
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
                            Editar Material
                        </h1>
                        <p className="text-gray-600 mt-1">Modifica la información del material</p>
                    </div>
                    <Link href={`/admin/courses/${courseId}/materials`}>
                        <Button variant="secondary" size="sm">
                            Volver a Materiales
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <MaterialForm courseId={courseId} materialId={materialId} onSuccess={handleSuccess} />
            </div>
        </div>
    );
}

export default function EditMaterialPage() {
    return <EditMaterialPageContent />;
}

