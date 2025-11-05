import { Course } from '@/shared/types';

export const MOCK_COURSES: Course[] = [
    {
        id: 'c-001',
        slug: 'metalurgia-del-oro-basico',
        title: 'Metalurgia del Oro: Fundamentos y Práctica',
        subtitle: 'De laboratorio a planta',
        description: 'Aprende procesos clave de cianuración, molienda y recuperación con casos reales.',
        category: 'Metalurgia',
        tags: ['oro', 'cianuración', 'procesos'],
        level: 'beginner',
        language: 'es',
        hours: 8,
        lessons: 24,
        rating: 4.7,
        ratingsCount: 128,
        price: 149,
        discountPrice: 119,
        thumbnailUrl: '/assets/img/bg-main.jpg',
        provider: 'fagsol',
        instructor: { id: 'i-001', name: 'Equipo Fagsol', title: 'Consultoría Industrial' },
    },
    {
        id: 'c-002',
        slug: 'agroindustria-calidad',
        title: 'Calidad en Procesos Agroindustriales',
        description: 'Buenas prácticas, control de calidad y trazabilidad.',
        category: 'Agroindustria',
        tags: ['calidad', 'trazabilidad'],
        level: 'intermediate',
        language: 'es',
        hours: 6,
        lessons: 18,
        rating: 4.5,
        ratingsCount: 76,
        price: 129,
        thumbnailUrl: '',
        provider: 'fagsol',
        instructor: { id: 'i-001', name: 'Equipo Fagsol' },
    },
    {
        id: 'c-003',
        slug: 'energias-renovables-introduccion',
        title: 'Introducción a Energías Renovables',
        description: 'Fundamentos de solar, eólica e hidráulica con ejemplos prácticos.',
        category: 'Energías Renovables',
        tags: ['solar', 'eólica'],
        level: 'beginner',
        language: 'es',
        hours: 5,
        lessons: 15,
        rating: 4.6,
        ratingsCount: 54,
        price: 99,
        thumbnailUrl: '/assets/img/bg-main.jpg',
        provider: 'instructor',
        instructor: { id: 'i-002', name: 'Camila R.' },
    },
];

// ===== Detalle de curso (mock)
export type CourseSection = {
    title: string;
    lessons: { title: string; durationMin: number; preview?: boolean }[];
};

export type CourseDetail = Course & {
    objectives: string[];
    requirements: string[];
    sections: CourseSection[];
};

export const MOCK_COURSE_DETAILS: Record<string, CourseDetail> = {
    'metalurgia-del-oro-basico': {
        ...MOCK_COURSES[0],
        objectives: [
            'Comprender el proceso de cianuración',
            'Aplicar parámetros de operación en planta',
            'Usar plantillas y checklists de control',
        ],
        requirements: ['Conocimientos básicos de química', 'Excel nivel básico'],
        sections: [
            {
                title: 'Fundamentos',
                lessons: [
                    { title: 'Introducción al curso', durationMin: 5, preview: true },
                    { title: 'Panorama del proceso', durationMin: 12 },
                ],
            },
            {
                title: 'Operación',
                lessons: [
                    { title: 'Control de pH y ORP', durationMin: 18 },
                    { title: 'Muestreo y calidad', durationMin: 14, preview: true },
                ],
            },
        ],
    },
    'agroindustria-calidad': {
        ...MOCK_COURSES[1],
        objectives: [
            'Implementar sistemas de gestión de calidad en agroindustria',
            'Aplicar buenas prácticas de manufactura (BPM)',
            'Diseñar sistemas de trazabilidad efectivos',
            'Realizar auditorías de calidad',
        ],
        requirements: ['Conocimientos básicos de procesos agroindustriales', 'Manejo de documentación'],
        sections: [
            {
                title: 'Introducción a la Calidad',
                lessons: [
                    { title: 'Bienvenida al curso', durationMin: 5, preview: true },
                    { title: 'Conceptos de calidad en agroindustria', durationMin: 15 },
                    { title: 'Normativas y certificaciones', durationMin: 20 },
                ],
            },
            {
                title: 'Buenas Prácticas de Manufactura',
                lessons: [
                    { title: 'Higiene y sanitización', durationMin: 18, preview: true },
                    { title: 'Control de procesos', durationMin: 22 },
                    { title: 'Manejo de personal', durationMin: 16 },
                ],
            },
            {
                title: 'Trazabilidad',
                lessons: [
                    { title: 'Sistemas de trazabilidad', durationMin: 25 },
                    { title: 'Documentación y registros', durationMin: 20 },
                    { title: 'Casos prácticos', durationMin: 18 },
                ],
            },
        ],
    },
    'energias-renovables-introduccion': {
        ...MOCK_COURSES[2],
        objectives: [
            'Comprender los fundamentos de energías solar, eólica e hidráulica',
            'Evaluar el potencial de energías renovables en proyectos',
            'Dimensionar sistemas básicos de energía solar',
            'Conocer casos de éxito en Latinoamérica',
        ],
        requirements: ['Conocimientos básicos de física', 'Interés en sostenibilidad'],
        sections: [
            {
                title: 'Introducción a Renovables',
                lessons: [
                    { title: 'Panorama energético global', durationMin: 10, preview: true },
                    { title: 'Tipos de energías renovables', durationMin: 15 },
                    { title: 'Impacto ambiental y sostenibilidad', durationMin: 12 },
                ],
            },
            {
                title: 'Energía Solar',
                lessons: [
                    { title: 'Fundamentos de energía solar', durationMin: 18, preview: true },
                    { title: 'Sistemas fotovoltaicos', durationMin: 22 },
                    { title: 'Dimensionamiento básico', durationMin: 20 },
                ],
            },
            {
                title: 'Otras Energías Renovables',
                lessons: [
                    { title: 'Energía eólica', durationMin: 16 },
                    { title: 'Energía hidráulica', durationMin: 14 },
                    { title: 'Casos de éxito', durationMin: 15 },
                ],
            },
        ],
    },
};

export function getCourseDetailBySlug(slug: string): CourseDetail | undefined {
    return MOCK_COURSE_DETAILS[slug];
}

export type CatalogFilter = {
    q?: string;
    category?: string;
    level?: string;
    provider?: 'fagsol' | 'instructor';
};

export function queryCatalog(filter: CatalogFilter = {}): Course[] {
    const { q, category, level, provider } = filter;
    return MOCK_COURSES.filter((c) => {
        const matchesQ = !q
            || c.title.toLowerCase().includes(q.toLowerCase())
            || c.description.toLowerCase().includes(q.toLowerCase())
            || c.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
        const matchesCategory = !category || c.category === category;
        const matchesLevel = !level || c.level === level;
        const matchesProvider = !provider || c.provider === provider;
        return matchesQ && matchesCategory && matchesLevel && matchesProvider;
    });
}


