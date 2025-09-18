import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: true
              }
            },
            productVariant: {
              select: {
                volume: true,
                sku: true
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, totalAmount, paymentMethod, notes, orderItems, shippingAddressId, billingAddressId } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        paymentMethod,
        notes,
        status: 'PENDING',
        shippingAddressId,
        billingAddressId,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            productVariantId: item.productVariantId || null,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            },
            productVariant: {
              select: {
                volume: true
              }
            }
          }
        },
        shippingAddress: true
      }
    })

    // Send order confirmation email
    try {
      const settings = await prisma.settings.findFirst()
      const deliveryCost = settings?.deliveryCost || 10
      const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 100
      
      const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shipping = subtotal >= freeDeliveryThreshold ? 0 : deliveryCost
      const total = subtotal + shipping

      const emailData = {
        orderId: order.orderNumber,
        customerName: order.user.name || 'Müştəri',
        customerEmail: order.user.email,
        orderItems: order.orderItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          volume: item.productVariant?.volume
        })),
        subtotal,
        shipping,
        total,
        deliveryAddress: order.shippingAddress ? 
          `${order.shippingAddress.fullName}\n${order.shippingAddress.address}\n${order.shippingAddress.city}, ${order.shippingAddress.postalCode}\n${order.shippingAddress.phone}` : 
          'Çatdırılma ünvanı təyin edilməyib',
        orderDate: order.createdAt
      }

      const emailResult = await sendOrderConfirmationEmail(emailData)
      
      if (emailResult.success) {
        console.log('Order confirmation email sent successfully:', order.orderNumber)
      } else {
        console.error('Failed to send order confirmation email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
