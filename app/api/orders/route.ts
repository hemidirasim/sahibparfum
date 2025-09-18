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

    // Check if user has any PENDING orders that can be reused
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        orderItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let order

    if (existingPendingOrder) {
      console.log('Reusing existing pending order:', existingPendingOrder.orderNumber)
      
      // Update existing order with new data
      order = await prisma.order.update({
        where: { id: existingPendingOrder.id },
        data: {
          totalAmount,
          paymentMethod,
          notes,
          shippingAddressId,
          billingAddressId,
          updatedAt: new Date()
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

      // Delete old order items and create new ones
      await prisma.orderItem.deleteMany({
        where: { orderId: existingPendingOrder.id }
      })

      await prisma.orderItem.createMany({
        data: orderItems.map((item: any) => ({
          orderId: existingPendingOrder.id,
          productId: item.productId,
          productVariantId: item.productVariantId || null,
          quantity: item.quantity,
          price: item.price
        }))
      })

      // Fetch updated order with new items
      order = await prisma.order.findUnique({
        where: { id: existingPendingOrder.id },
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
    } else {
      console.log('Creating new order')
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      order = await prisma.order.create({
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
        customerName: order.user?.name || 'Müştəri',
        customerEmail: order.user?.email || '',
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
          `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}\n${order.shippingAddress.address1}${order.shippingAddress.address2 ? '\n' + order.shippingAddress.address2 : ''}\n${order.shippingAddress.city}, ${order.shippingAddress.postalCode}\n${order.shippingAddress.phone}` : 
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
