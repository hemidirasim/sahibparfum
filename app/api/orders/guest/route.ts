import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guestName,
      guestEmail,
      guestPhone,
      totalAmount,
      paymentMethod,
      notes,
      orderItems,
      shippingAddress,
      billingAddress
    } = body

    // Validate required fields
    if (!guestName || !guestEmail || !guestPhone || !totalAmount || !orderItems || !shippingAddress) {
      return NextResponse.json({ error: 'Bütün məcburi sahələr doldurulmalıdır' }, { status: 400 })
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create shipping address
    const shippingAddressRecord = await prisma.address.create({
      data: {
        type: 'SHIPPING',
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone
      }
    })

    // Create billing address (same as shipping if not specified)
    const billingAddressRecord = await prisma.address.create({
      data: {
        type: 'BILLING',
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        address1: billingAddress.address1,
        address2: billingAddress.address2,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
        phone: billingAddress.phone
      }
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        guestName,
        guestEmail,
        guestPhone,
        totalAmount,
        paymentMethod,
        notes,
        shippingAddressId: shippingAddressRecord.id,
        billingAddressId: billingAddressRecord.id,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      }
    })

    return NextResponse.json({
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: 'Sifariş uğurla yaradıldı'
    })
  } catch (error) {
    console.error('Guest order create error:', error)
    return NextResponse.json({ error: 'Sifariş yaradılarkən xəta baş verdi' }, { status: 500 })
  }
}
