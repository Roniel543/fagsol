'use client';

import { useMemo, useState } from 'react';
import { CourseCard } from '../components/CourseCard';
import { FiltersBar } from '../components/FiltersBar';
import { AcademyHeader } from '../components/AcademyHeader';
import { Footer } from '@/shared/components';
import { MOCK_COURSES, queryCatalog } from '../services/catalog.mock';

export default function CatalogPage() {
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');
    const [provider, setProvider] = useState('');

    const categories = useMemo(() => Array.from(new Set(MOCK_COURSES.map((c) => c.category))), []);
    const results = useMemo(() => queryCatalog({ q, category, level, provider: provider as any }), [q, category, level, provider]);

    return (
        <>
            <AcademyHeader />
            <main className="flex min-h-screen flex-col bg-primary-black text-primary-white">
                <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Cursos</h1>

                <div className="mt-5">
                    <FiltersBar
                        q={q}
                        category={category}
                        level={level}
                        categories={categories}
                        provider={provider}
                        onChange={(next) => {
                            if (next.q !== undefined) setQ(next.q);
                            if (next.category !== undefined) setCategory(next.category || '');
                            if (next.level !== undefined) setLevel(next.level || '');
                            if (next.provider !== undefined) setProvider(next.provider || '');
                        }}
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}


