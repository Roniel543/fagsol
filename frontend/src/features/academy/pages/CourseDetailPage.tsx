'use client';

import { Footer, SafeHTML, useToast } from '@/shared/components';
import { useCart } from '@/shared/contexts/CartContext';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCourseBySlug, useCourses } from '@/shared/hooks/useCourses';
import { useEnrollments } from '@/shared/hooks/useEnrollments';
import { Edit } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { AcademyHeader } from '../components/AcademyHeader';
import { CourseCard } from '../components/CourseCard';

export default function CourseDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug as string;
    const router = useRouter();
    const { showToast } = useToast();
    const { addToCart, cartItems } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { enrollments } = useEnrollments();

    // Obtener curso del backend usando SWR
    const { course: detail, isLoading, isError } = useCourseBySlug(slug);

    // Obtener otros cursos para recomendaciones
    const { courses: allCourses } = useCourses({ status: 'published' });

    // Verificar si el curso ya está en el carrito
    const isInCart = useMemo(() => {
        if (!detail) return false;
        return cartItems.some((item) => item.id === detail.id);
    }, [cartItems, detail]);

    // Verificar si el usuario está inscrito
    const isEnrolled = useMemo(() => {
        if (!detail || !isAuthenticated || !enrollments.length) return false;
        return enrollments.some(
            (enrollment) => enrollment.course.id === detail.id && enrollment.status === 'active'
        );
    }, [detail, enrollments, isAuthenticated]);

    // Verificar si es admin
    const isAdmin = useMemo(() => {
        return user?.role === 'admin';
    }, [user]);

    // Verificar si el instructor es el creador del curso
    const isCourseCreator = useMemo(() => {
        if (!detail || !user) return false;
        // Verificar si el backend indica que es el creador
        const backendIsCreator = (detail as any).is_creator === true;
        return backendIsCreator;
    }, [detail, user]);

    // Loading state
    if (isLoading) {
        return (
            <>
                <AcademyHeader />
                <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
                            <p className="mt-4 text-gray-400">Cargando curso...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Error state o curso no encontrado
    if (isError || !detail) {
        // Si es instructor o admin, mostrar mensaje más útil en lugar de 404
        if (isAdmin || user?.role === 'instructor') {
            return (
                <>
                    <AcademyHeader />
                    <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                            <div className="rounded-xl border border-status-error/50 bg-status-error/10 p-6 text-center">
                                <h2 className="text-xl font-semibold text-status-error mb-2">
                                    Curso no encontrado
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    El curso con slug "{slug}" no existe o no está disponible.
                                </p>
                                <button
                                    onClick={() => router.push('/instructor/courses')}
                                    className="px-4 py-2 bg-primary-orange text-primary-black rounded-lg hover:opacity-90"
                                >
                                    Volver a Mis Cursos
                                </button>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </>
            );
        }
        return notFound();
    }

    const handleAddToCart = () => {
        // Validar si ya está en el carrito
        if (isInCart) {
            showToast('Este curso ya está en tu carrito', 'info');
            return;
        }

        // Agregar al carrito usando el hook (esto dispara el evento automáticamente)
        addToCart(detail.id);
        showToast('¡Curso agregado al carrito!', 'cart');
    };

    const handleAccessCourse = () => {
        router.push(`/academy/course/${slug}/learn`);
    };

    const priceBlock = (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sticky top-6">
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-primary-orange">{detail.discountPrice ? `S/ ${detail.discountPrice}` : `S/ ${detail.price}`}</div>
                {detail.discountPrice && (
                    <div className="text-sm text-gray-400 line-through">S/ {detail.price}</div>
                )}
            </div>

            {/* Botones según el tipo de usuario */}
            {isCourseCreator ? (
                // Si es el creador del curso (instructor o admin que lo creó)
                <div className="mt-4 space-y-2">
                    <button
                        onClick={handleAccessCourse}
                        className="w-full rounded-lg font-semibold py-3 bg-primary-orange text-primary-black hover:opacity-90 hover:scale-105 transition-all"
                    >
                        Ver Contenido del Curso
                    </button>
                    <button
                        onClick={() => {
                            if (user?.role === 'instructor') {
                                router.push(`/instructor/courses/${detail.id}/edit`);
                            } else {
                                router.push(`/admin/courses/${detail.id}/edit`);
                            }
                        }}
                        className="w-full rounded-lg font-semibold py-2 bg-zinc-700 text-white hover:bg-zinc-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Editar Curso
                    </button>
                </div>
            ) : (isEnrolled || isAdmin) ? (
                // Si está inscrito o es admin (admin puede acceder a cualquier curso)
                <button
                    onClick={handleAccessCourse}
                    className="mt-4 w-full rounded-lg font-semibold py-3 bg-primary-orange text-primary-black hover:opacity-90 hover:scale-105 transition-all"
                >
                    Acceder al Curso
                </button>
            ) : (
                <>
                    <button
                        onClick={handleAddToCart}
                        disabled={isInCart}
                        className={`mt-4 w-full rounded-lg font-semibold py-3 transition-all ${isInCart
                            ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-orange text-primary-black hover:opacity-90 hover:scale-105'
                            }`}
                    >
                        {isInCart ? '✓ Ya está en el carrito' : 'Agregar al carrito'}
                    </button>
                    <div className="mt-3 text-xs text-gray-400">Acceso de por vida • Certificado • Actualizaciones incluidas</div>
                </>
            )}
        </div>
    );

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <span className="text-xs text-primary-orange font-semibold">
                                {detail.category || 'General'} • {detail.provider === 'fagsol' ? 'Fagsol' : 'Instructor'}
                            </span>
                            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold">{detail.title}</h1>
                            <SafeHTML html={detail.description} className="mt-2 text-gray-300" tag="div" />

                            {/* Mostrar módulos si están disponibles */}
                            {detail.modules && detail.modules.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="font-semibold">Contenido del curso</h2>
                                    <div className="mt-3 space-y-3">
                                        {detail.modules.map((module) => (
                                            <div key={module.id} className="rounded-lg border border-zinc-800">
                                                <div className="px-4 py-3 bg-zinc-900/60 font-medium">
                                                    {module.title}
                                                    {module.description && (
                                                        <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                                                    )}
                                                </div>
                                                <ul className="p-4 space-y-2">
                                                    {module.lessons.map((lesson) => (
                                                        <li key={lesson.id} className="flex items-center justify-between text-sm text-gray-300">
                                                            <span>
                                                                {lesson.title}
                                                                {lesson.order === 0 && (
                                                                    <span className="ml-2 text-xs text-primary-orange">Preview</span>
                                                                )}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {lesson.duration_minutes > 0 ? `${lesson.duration_minutes} min` : ''}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>{priceBlock}</div>
                    </div>

                    {allCourses.length > 1 && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold">Otros cursos recomendados</h3>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {allCourses.filter(c => c.id !== detail.id).slice(0, 3).map(c => (
                                    <CourseCard key={c.id} course={c} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}


