import CatalogPage from '@/features/academy/pages/CatalogPage';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-primary-black">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
                    <p className="mt-4 text-gray-400">Cargando catálogo...</p>
                </div>
            </div>
        }>
            <CatalogPage />
        </Suspense>
    );
}


