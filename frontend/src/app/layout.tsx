import { ToastProvider } from '@/shared/components/Toast'
import { CartProvider } from '@/shared/contexts/CartContext'
import { AuthProvider } from '@/shared/hooks/useAuth'
import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'FagSol S.A.C.',
  description: 'Soluciones Tecnológicas para tu empresa y negocio ',
  icons: {
    icon: '/assets/fav-fagsol.png',
    apple: '/assets/fav-fagsol.png',
    shortcut: '/assets/fav-fagsol.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${sora.className} min-h-screen bg-cover bg-center bg-no-repeat`}>
        {/* Pre-cargar SDK de Mercado Pago para optimizar checkout */}
        <Script
          src="https://sdk.mercadopago.com/js/v2"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <div className="min-h-screen bg-primary-black ">
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}