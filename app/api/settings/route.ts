import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          siteName: 'Sahib Parfumeriya',
          siteDescription: 'Premium Parfüm Mağazası',
          contactEmail: 'info@sahibparfumeriya.az',
          contactPhone: '+994 50 123 45 67',
          address: 'Bakı şəhəri, Nərimanov rayonu',
          currency: 'AZN',
          taxRate: 18.0,
          deliveryCost: 10.0,
          freeDeliveryThreshold: 100.0,
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true,
          // Meta data defaults
          metaTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          metaDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
          metaKeywords: 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
          metaAuthor: 'SAHIB perfumery & cosmetics',
          ogTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          ogDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
          ogLocale: 'az_AZ',
          ogType: 'website',
          twitterCard: 'summary',
          twitterTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          twitterDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create new settings if none exist
      settings = await prisma.settings.create({
        data: body
      })
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: body
      })
    }

    // Revalidate settings-related pages
    try {
      revalidatePath('/api/settings')
      revalidatePath('/')
      revalidatePath('/cart')
      revalidatePath('/checkout')
    } catch (revalidateError) {
      console.error('Settings revalidation error:', revalidateError)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
