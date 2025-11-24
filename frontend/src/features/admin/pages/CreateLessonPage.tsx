'use client';

import { Button, Card } from '@/shared/components';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LessonForm } from '../components/LessonForm';

function CreateLessonPageContent() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;
    const moduleId = params?.moduleId as string;

    const handleSuccess = () => {
        router.push(`/admin/courses/${courseId}/modules/${moduleId}/lessons`);
    };

    if (!courseId || !moduleId) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">ID de curso o módulo no válido</p>
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
                            Crear Nueva Lección
                        </h1>
                        <p className="text-gray-600 mt-1">Completa el formulario para crear una nueva lección</p>
                    </div>
                    <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`}>
                        <Button variant="secondary" size="sm">
                            Volver a Lecciones
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <Card className="p-8">
                <LessonForm moduleId={moduleId} onSuccess={handleSuccess} />
            </Card>
        </div>
    );
}

export default function CreateLessonPage() {
    return <CreateLessonPageContent />;
}

