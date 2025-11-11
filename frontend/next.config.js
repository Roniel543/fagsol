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

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' necesario para Next.js en desarrollo
              "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' necesario para Tailwind
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.mercadopago.com https://*.mercadopago.com",
              "frame-src 'self' https://www.mercadopago.com https://*.mercadopago.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

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

