'use client';

import { Button, Card, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CourseForm } from '../components/CourseForm';

function EditCoursePageContent() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const courseId = params?.id as string;

    const handleSuccess = () => {
        // Redirigir según el rol del usuario
        if (user?.role === 'instructor') {
            router.push('/instructor/courses');
        } else {
            router.push('/admin/courses');
        }
    };

    if (!courseId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-red-600">ID de curso no válido</p>
                    <Link href="/admin/courses">
                        <Button variant="primary" className="mt-4">
                            Volver a Cursos
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Editar Curso
                            </h1>
                            <p className="text-gray-600">Modifica la información del curso</p>
                        </div>
                        <Link href={user?.role === 'instructor' ? '/instructor/courses' : '/admin/courses'}>
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
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
                        <CourseForm courseId={courseId} onSuccess={handleSuccess} />
                    </div>
                </div>
            </main>
        </div>
    );
}

// Componente principal que envuelve con ProtectedRoute
export default function EditCoursePage() {
    return (
        <ProtectedRoute allowedRoles={['admin', 'instructor']} fallbackRoute="/dashboard">
            <EditCoursePageContent />
        </ProtectedRoute>
    );
}

