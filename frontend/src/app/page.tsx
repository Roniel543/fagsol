export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          FagSol Escuela Virtual
        </h1>
        <p className="text-center text-lg text-gray-600">
          Plataforma educativa en desarrollo
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🎓 Cursos</h2>
            <p className="text-gray-600">
              Accede a cursos especializados en automatización industrial
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">📚 Módulos</h2>
            <p className="text-gray-600">
              Aprende a tu ritmo con módulos individuales
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🏆 Certificados</h2>
            <p className="text-gray-600">
              Obtén certificados verificables al completar
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

