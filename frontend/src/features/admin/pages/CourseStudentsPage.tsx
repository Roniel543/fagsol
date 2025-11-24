'use client';

import { Button, Card, LoadingSpinner } from '@/shared/components';
import { useAdminStudents } from '@/shared/hooks/useAdminStudents';
import { useCourse } from '@/shared/hooks/useCourses';
import { CheckCircle, Eye, Search, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

function CourseStudentsPageContent() {
    const params = useParams();
    const courseId = params?.id as string;
    const { course, isLoading: isLoadingCourse } = useCourse(courseId);
    const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
    const { students, isLoading, mutate } = useAdminStudents(courseId, {
        status: filters.status as any,
        search: filters.search,
    });

    const getStatusBadge = (status: string) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo', icon: <CheckCircle className="w-4 h-4" /> },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completado', icon: <CheckCircle className="w-4 h-4" /> },
            expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expirado', icon: <XCircle className="w-4 h-4" /> },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado', icon: <XCircle className="w-4 h-4" /> },
        };
        const badge = badges[status as keyof typeof badges] || badges.active;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${badge.bg} ${badge.text}`}>
                {badge.icon}
                <span>{badge.label}</span>
            </span>
        );
    };

    if (isLoadingCourse) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-600">Cargando curso...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center py-12">
                <Card className="p-8 text-center">
                    <p className="text-red-600 mb-4">Curso no encontrado</p>
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
                            Alumnos Inscritos: {course.title}
                        </h1>
                        <p className="text-gray-600 mt-1">Gestiona y visualiza el progreso de los alumnos</p>
                    </div>
                    <Link href="/admin/courses">
                        <Button variant="secondary" size="sm">
                            Volver a Cursos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar por nombre o email
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={filters.search || ''}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Buscar alumno..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        >
                            <option value="">Todos</option>
                            <option value="active">Activo</option>
                            <option value="completed">Completado</option>
                            <option value="expired">Expirado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">Cargando alumnos...</p>
                </div>
            )}

            {/* Students List */}
            {!isLoading && (
                <>
                    {students.length === 0 ? (
                        <Card className="p-8 text-center">
                            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">No hay alumnos inscritos en este curso.</p>
                        </Card>
                    ) : (
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Alumno
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Progreso
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha Inscripción
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => (
                                            <tr key={student.enrollment_id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary-orange to-amber-500 flex items-center justify-center text-primary-black font-bold">
                                                            {student.user_first_name ? student.user_first_name[0].toUpperCase() : ''}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.user_first_name} {student.user_last_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{student.user_email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(student.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                                            <div
                                                                className="bg-primary-orange h-2.5 rounded-full"
                                                                style={{ width: `${student.completion_percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-700 font-medium">
                                                            {student.completion_percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.enrolled_at
                                                        ? new Date(student.enrolled_at).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/admin/courses/${courseId}/students/${student.enrollment_id}/progress`}>
                                                        <Button variant="primary" size="sm">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Ver Progreso
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

export default function CourseStudentsPage() {
    return <CourseStudentsPageContent />;
}

