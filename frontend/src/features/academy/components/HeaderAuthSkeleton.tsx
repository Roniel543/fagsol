/**
 * Skeleton placeholder para mantener el espacio del área de autenticación
 * durante la carga inicial. Evita layout shift y FOUC.
 * 
 * IMPORTANTE: Este skeleton siempre renderiza la misma estructura (sin <nav>)
 * para evitar errores de hidratación. El tamaño es aproximado al contenido real.
 */
export function HeaderAuthSkeleton() {
  // Skeleton unificado que mantiene el espacio sin importar el estado de auth
  // Usa divs en lugar de <nav> para evitar mismatch de hidratación
  // Tamaño aproximado: ~280px de ancho total
  return (
    <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">
      {/* Skeleton para nav links - usando div en lugar de nav para evitar mismatch */}
      <div className="flex items-center gap-4 xl:gap-6">
        <div className="h-5 w-24 bg-zinc-800/50 rounded animate-pulse" />
        <div className="h-5 w-28 bg-zinc-800/50 rounded animate-pulse" />
      </div>
      {/* Skeleton para cart */}
      <div className="h-8 w-8 bg-zinc-800/50 rounded-full animate-pulse flex-shrink-0" />
      {/* Skeleton para profile */}
      <div className="h-10 w-10 bg-zinc-800/50 rounded-full animate-pulse flex-shrink-0" />
    </div>
  );
}

