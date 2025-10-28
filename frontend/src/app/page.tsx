'use client';

import { LoadingSpinner } from '@/shared/components';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay usuario logueado
    const userData = localStorage.getItem('user');

    if (userData) {
      // Si hay usuario logueado, ir al dashboard
      router.push('/dashboard');
    } else {
      // Si no hay usuario, ir al login
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h1 className="text-4xl font-bold text-center mb-8 mt-4">
            FagSol Escuela Virtual
          </h1>
          <p className="text-center text-lg text-gray-600">
            Redirigiendo...
          </p>
        </div>
      </div>
    </main>
  );
}