'use client';

import { AcademyHeader, AcademyHero } from '../index';
import { Footer } from '@/shared/components';

export function AcademyHomePage() {
    return (
        <main className="flex min-h-screen flex-col">
            <AcademyHeader />
            <AcademyHero />
            
            {/* Aquí irán más secciones en la Fase 2 */}
            {/* - Cursos destacados */}
            {/* - Rutas de aprendizaje */}
            {/* - Instructores */}
            {/* - Testimonios */}
            
            <Footer />
        </main>
    );
}

export default AcademyHomePage;

