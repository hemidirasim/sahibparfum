import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sahib Parfumeriya - Premium Parfüm Mağazası',
  description: 'Sahib Parfumeriya - Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
  keywords: 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
  authors: [{ name: 'Sahib Parfumeriya' }],
  openGraph: {
    title: 'Sahib Parfumeriya - Premium Parfüm Mağazası',
    description: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
    type: 'website',
    locale: 'az_AZ',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
