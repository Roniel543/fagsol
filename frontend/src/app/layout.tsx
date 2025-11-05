import { AuthProvider } from '@/shared/hooks/useAuth'
import { CartProvider } from '@/shared/contexts/CartContext'
import { ToastProvider } from '@/shared/components/Toast'
import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'FagSol S.A.C.',
  description: 'Soluciones Tecnológicas para tu empresa y negocio ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${sora.className} min-h-screen bg-cover bg-center bg-no-repeat`}>
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