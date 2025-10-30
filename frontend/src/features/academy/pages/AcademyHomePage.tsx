'use client';

import { Footer } from '@/shared/components';
import { AcademyHeader, AcademyHero, CourseCard, TeachWithUsSection, TestimonialsSection, WhyAcademySection } from '../index';
import { MOCK_COURSES } from '../services/catalog.mock';

export function AcademyHomePage() {
    return (
        <main className="flex min-h-screen flex-col">
            <AcademyHeader />
            <AcademyHero />
            {/* Carruseles de cursos */}
            <section className="bg-primary-black text-primary-white px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold">Cursos Fagsol</h2>
                    <div className="mt-5 grid grid-flow-col auto-cols-[80%] sm:auto-cols-[45%] lg:auto-cols-[30%] gap-4 overflow-x-auto pb-2">
                        {MOCK_COURSES.filter(c => c.provider === 'fagsol').map(c => (
                            <CourseCard key={c.id} course={c} />
                        ))}
                    </div>
                </div>
            </section>
            <section className="bg-primary-black text-primary-white px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-bold">De la comunidad</h2>
                    <div className="mt-5 grid grid-flow-col auto-cols-[80%] sm:auto-cols-[45%] lg:auto-cols-[30%] gap-4 overflow-x-auto pb-2">
                        {MOCK_COURSES.filter(c => c.provider === 'instructor').map(c => (
                            <CourseCard key={c.id} course={c} />
                        ))}
                    </div>
                </div>
            </section>
            <WhyAcademySection />
            <TeachWithUsSection />
            <TestimonialsSection />

            <Footer />
        </main>
    );
}

export default AcademyHomePage;

