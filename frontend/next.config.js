/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración de imágenes
  images: {
    // En desarrollo, desactivar optimización para permitir cualquier dominio
    // En producción, usar remotePatterns con dominios específicos
    ...(process.env.NODE_ENV === 'development' ? {
      unoptimized: true, // Desactiva optimización pero permite cualquier dominio
    } : {}),

    // Para Vercel, puedes usar remotePatterns (más seguro)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fagsol.com',
      },
      {
        protocol: 'https',
        hostname: '**.azurewebsites.net', // Azure App Service
      },
      {
        protocol: 'https',
        hostname: '**.blob.core.windows.net', // Azure Blob Storage
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com', // Para desarrollo/testing
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
  turbopack: {},

  // Nota: Las variables NEXT_PUBLIC_* se cargan automáticamente desde .env
  // No es necesario definirlas aquí a menos que quieras un valor por defecto diferente

  // Configuración para producción
  // 'standalone' es necesario para Azure App Service - crea una versión optimizada
  output: 'standalone',

  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,

  // Configuración de webpack para excluir jsdom del bundle del cliente
  webpack: (config, { isServer }) => {
    // Excluir jsdom y sus dependencias del bundle del cliente
    // jsdom solo debe ejecutarse en el servidor
    if (!isServer) {
      // Configurar fallbacks para módulos de Node.js que no existen en el navegador
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        buffer: false,
      };

      // Excluir jsdom y sus dependencias del bundle del cliente
      // Usar IgnorePlugin para evitar que webpack intente empaquetar jsdom
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^jsdom$/,
        })
      );
    }

    return config;
  },

  // Headers de seguridad
  async headers() {
    // Obtener URL del backend desde variables de entorno
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const backendBaseUrl = apiUrl.replace('/api/v1', ''); // Extraer base URL sin /api/v1

    // Construir directiva img-src dinámicamente
    const imgSrcDirectives = [
      "'self'",
      "data:",
      "https:",
      "blob:",
      "https://images.unsplash.com",
      "https://*.unsplash.com",
      "https://*.blob.core.windows.net", // Azure Blob Storage
    ];

    // En desarrollo, agregar URLs HTTP del backend local
    if (process.env.NODE_ENV === 'development' || backendBaseUrl.includes('localhost') || backendBaseUrl.includes('127.0.0.1')) {
      imgSrcDirectives.push("http://localhost:8000", "http://127.0.0.1:8000");
    }

    // En producción, agregar la URL del backend si es HTTPS
    if (process.env.NODE_ENV === 'production' && backendBaseUrl.startsWith('https://')) {
      imgSrcDirectives.push(backendBaseUrl);
    }

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://sdk.mercadopago.com https://*.mercadopago.com https://http2.mlstatic.com https://*.mlstatic.com", // 'unsafe-eval' necesario para Next.js en desarrollo, Mercado Pago SDK y Bricks
      "style-src 'self' 'unsafe-inline'", // 'unsafe-inline' necesario para Tailwind
      `img-src ${imgSrcDirectives.join(' ')}`, // Permitir imágenes del backend y Azure Blob Storage
      "font-src 'self' data:",
      "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 https://*.azurewebsites.net https://api.mercadopago.com https://*.mercadopago.com https://www.mercadolibre.com https://*.mercadolibre.com https://http2.mlstatic.com https://*.mlstatic.com https://api.mercadolibre.com", // Azure App Service y Mercado Pago Bricks necesita mlstatic.com para assets
      "frame-src 'self' https://www.mercadopago.com https://*.mercadopago.com https://www.mercadolibre.com https://*.mercadolibre.com https://player.vimeo.com ",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    // Solo agregar upgrade-insecure-requests en producción (no en desarrollo con localhost)
    if (process.env.NODE_ENV === 'production') {
      cspDirectives.push("upgrade-insecure-requests");
    }

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
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

