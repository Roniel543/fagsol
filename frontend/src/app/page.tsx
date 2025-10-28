'use client';

import { Button, LoadingSpinner } from '@/shared/components';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario logueado
    const userData = localStorage.getItem('user');

    if (userData) {
      // Si hay usuario logueado, ir al dashboard automáticamente
      router.push('/dashboard');
    } else {
      // Si no hay usuario, mostrar el home page
      setIsLoading(false);
    }
  }, [router]);

  // Mientras verifica el estado de autenticación
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <div className="animate-pulse text-gray-600">Cargando...</div>
      </main>
    );
  }

  // Home page para usuarios no autenticados
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Logo/Título */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900">
              FagSol
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-blue-600">
              Escuela Virtual
            </h2>
          </div>

          {/* Descripción */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
            Plataforma de educación virtual moderna y escalable. Aprende a tu ritmo, desde cualquier lugar.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-lg mb-2">Cursos Online</h3>
              <p className="text-gray-600 text-sm">
                Accede a cursos de alta calidad
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-lg mb-2">Certificados</h3>
              <p className="text-gray-600 text-sm">
                Obtén certificados al completar
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="font-semibold text-lg mb-2">Aprende Flexible</h3>
              <p className="text-gray-600 text-sm">
                A tu propio ritmo y horario
              </p>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              onClick={() => router.push('/auth/register')}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              Crear Cuenta
            </Button>
            <Button
              onClick={() => router.push('/auth/login')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              Iniciar Sesión
            </Button>
          </div>

          {/* Footer Info */}
          <div className="pt-12 text-gray-500 text-sm">
            <p>Sistema de gestión de aprendizaje moderno y escalable</p>
          </div>
        </div>
      </div>
    </main>
  );
}