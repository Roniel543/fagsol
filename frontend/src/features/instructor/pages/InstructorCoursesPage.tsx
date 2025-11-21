'use client';

import { Button, ProtectedRoute } from '@/shared/components';
import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Plus, Edit, Eye, Trash2, Clock, CheckCircle2 } from 'lucide-react';

function InstructorCoursesPageContent() {
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all');

    // TODO: Implementar fetch de cursos del instructor
    const courses: any[] = []; // Placeholder
    const isLoading = false;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mis Cursos
                            </h1>
                            <p className="text-gray-600 mt-1">Gestiona todos tus cursos desde aquí</p>
                        </div>
                        <Link href="/instructor/courses/new">
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Nuevo Curso
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            statusFilter === 'all'
                                ? 'bg-primary-orange text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setStatusFilter('published')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            statusFilter === 'published'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Publicados
                    </button>
                    <button
                        onClick={() => setStatusFilter('draft')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            statusFilter === 'draft'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Borradores
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            statusFilter === 'pending'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Pendientes
                    </button>
                </div>

                {/* Lista de Cursos */}
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando cursos...</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes cursos aún</h3>
                        <p className="text-gray-600 mb-6">Comienza creando tu primer curso</p>
                        <Link href="/instructor/courses/new">
                            <Button variant="primary">
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Mi Primer Curso
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    course.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : course.status === 'draft'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}
                                            >
                                                {course.status === 'published'
                                                    ? 'Publicado'
                                                    : course.status === 'draft'
                                                    ? 'Borrador'
                                                    : 'Pendiente'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {course.enrollments || 0} inscripciones
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {course.rating || 0.0} ⭐
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button variant="secondary" size="sm">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="secondary" size="sm">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="danger" size="sm">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function InstructorCoursesPage() {
    return (
        <ProtectedRoute allowedRoles={['instructor']} fallbackRoute="/dashboard">
            <InstructorCoursesPageContent />
        </ProtectedRoute>
    );
}

