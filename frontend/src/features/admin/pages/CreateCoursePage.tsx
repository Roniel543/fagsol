'use client';

import { useRouter } from 'next/navigation';
import { CourseForm } from '../components/CourseForm';
import { Button, Card, ProtectedRoute } from '@/shared/components';
import Link from 'next/link';

function CreateCoursePageContent() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/admin/courses');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Crear Nuevo Curso
                            </h1>
                            <p className="text-gray-600">Completa el formulario para crear un nuevo curso</p>
                        </div>
                        <Link href="/admin/courses">
                            <Button variant="secondary" size="sm">
                                Volver a Cursos
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Card className="p-8">
                        <CourseForm onSuccess={handleSuccess} />
                    </Card>
                </div>
            </main>
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export default function CreateCoursePage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor']} fallbackRoute="/dashboard">
            <CreateCoursePageContent />
        </ProtectedRoute>
    );
}

