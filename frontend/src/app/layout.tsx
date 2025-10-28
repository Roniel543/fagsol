import { AuthProvider } from '@/shared/hooks/useAuth'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FagSol Escuela Virtual',
  description: 'Plataforma de educación virtual moderna y escalable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}