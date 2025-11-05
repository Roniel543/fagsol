/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de imágenes
  images: {
    domains: [
      'localhost',
      'fagsol.com',
      'backend',
      // Agregar dominios de imágenes externas (ej: AWS S3, Cloudinary)
    ],
    // Para Vercel, puedes usar remotePatterns (más seguro)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fagsol.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // Variables de entorno públicas (accesibles en el cliente)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // Configuración para producción
  // En Vercel no necesitas 'standalone', pero puedes dejarlo si planeas usar Docker
  // output: 'standalone', // Comentado para Vercel

  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,

  // Configuración de redirecciones si necesitas
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-path',
  //       destination: '/new-path',
  //       permanent: true,
  //     },
  //   ]
  // },
}

module.exports = nextConfig

