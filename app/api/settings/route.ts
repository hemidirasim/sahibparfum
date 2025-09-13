import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          requireEmailVerification: true
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

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
