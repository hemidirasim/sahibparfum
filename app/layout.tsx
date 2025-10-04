import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { prisma } from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch settings from database
    const settings = await prisma.settings.findFirst()
    
    if (settings) {
      return {
        title: settings.metaTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
        description: settings.metaDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
        keywords: settings.metaKeywords || 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
        authors: [{ name: settings.metaAuthor || 'SAHIB perfumery & cosmetics' }],
        icons: {
          icon: '/favicon.svg',
        },
        openGraph: {
          title: settings.ogTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          description: settings.ogDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
          type: (settings.ogType as any) || 'website',
          locale: settings.ogLocale || 'az_AZ',
        },
        twitter: {
          card: (settings.twitterCard as any) || 'summary',
          title: settings.twitterTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          description: settings.twitterDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
        },
      }
    }
  } catch (error) {
    console.error('Error fetching settings for metadata:', error)
  }
  
  // Fallback metadata if settings fetch fails
  return {
    title: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
    description: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
    keywords: 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
    authors: [{ name: 'SAHIB perfumery & cosmetics' }],
    icons: {
      icon: '/favicon.svg',
    },
    openGraph: {
      title: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
      description: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
      type: 'website',
      locale: 'az_AZ',
    },
    twitter: {
      card: 'summary',
      title: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
      description: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
    },
  }
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
