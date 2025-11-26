'use client';

import { Button, ProtectedRoute } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseForm } from '../components/CourseForm';

function CreateCoursePageContent() {
    const router = useRouter();
    const { user } = useAuth();

    const handleSuccess = () => {
        // Redirigir según el rol del usuario
        if (user?.role === 'instructor') {
            router.push('/instructor/courses');
        } else {
            router.push('/admin/courses');
        }
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
                        <CourseForm onSuccess={handleSuccess} />
                    </div>
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

