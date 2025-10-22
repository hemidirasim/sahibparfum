import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

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

    // Check if guest has any PENDING orders that can be reused
    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        guestEmail: guestEmail,
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
      
      // Update existing order with new data
      order = await prisma.order.update({
        where: { id: existingPendingOrder.id },
        data: {
          guestName,
          guestPhone,
          totalAmount,
          paymentMethod,
          notes,
          updatedAt: new Date()
        },
        include: {
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
          shippingAddress: true,
          billingAddress: true
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
          shippingAddress: true,
          billingAddress: true
        }
      })
    } else {
      
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
      order = await prisma.order.create({
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
              productVariantId: item.productVariantId || null,
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
          shippingAddress: true,
          billingAddress: true
        }
      })
    }

    // Send order confirmation email
    try {
      if (!order) {
        console.error('Order is null, cannot send email')
        return NextResponse.json(order)
      }

      const settings = await prisma.settings.findFirst()
      const deliveryCost = settings?.deliveryCost || 10
      const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 100
      
      const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shipping = subtotal >= freeDeliveryThreshold ? 0 : deliveryCost
      const total = subtotal + shipping

      const emailData = {
        orderId: order.orderNumber,
        customerName: order.guestName || 'Müştəri',
        customerEmail: order.guestEmail || '',
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
      } else {
        console.error('Failed to send guest order confirmation email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending guest order confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      orderNumber: order?.orderNumber || '',
      orderId: order?.id || '',
      message: 'Sifariş uğurla yaradıldı'
    })
  } catch (error) {
    console.error('Guest order create error:', error)
    return NextResponse.json({ error: 'Sifariş yaradılarkən xəta baş verdi' }, { status: 500 })
  }
}
