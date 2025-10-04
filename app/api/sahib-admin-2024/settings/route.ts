import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings or create default if not exists
    let settings = await prisma.settings.findFirst()
    
    if (!settings) {
      // Create default settings
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
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Get existing settings or create new one
    let settings = await prisma.settings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          siteName: body.siteName,
          siteDescription: body.siteDescription,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          address: body.address,
          currency: body.currency,
          taxRate: parseFloat(body.taxRate) || 18.0,
          deliveryCost: parseFloat(body.deliveryCost) || 10.0,
          freeDeliveryThreshold: parseFloat(body.freeDeliveryThreshold) || 100.0,
          maintenanceMode: Boolean(body.maintenanceMode),
          allowRegistration: Boolean(body.allowRegistration),
          requireEmailVerification: Boolean(body.requireEmailVerification)
        }
      })
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          siteName: body.siteName || 'Sahib Parfumeriya',
          siteDescription: body.siteDescription || 'Premium Parfüm Mağazası',
          contactEmail: body.contactEmail || 'info@sahibparfumeriya.az',
          contactPhone: body.contactPhone || '+994 50 123 45 67',
          address: body.address || 'Bakı şəhəri, Nərimanov rayonu',
          currency: body.currency || 'AZN',
          taxRate: parseFloat(body.taxRate) || 18.0,
          deliveryCost: parseFloat(body.deliveryCost) || 10.0,
          freeDeliveryThreshold: parseFloat(body.freeDeliveryThreshold) || 100.0,
          maintenanceMode: Boolean(body.maintenanceMode),
          allowRegistration: Boolean(body.allowRegistration),
          requireEmailVerification: Boolean(body.requireEmailVerification)
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully',
      settings 
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
