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

    // Format orders with installment data
    const formattedOrders = orders.map(order => ({
      ...order,
      installmentData: order.paymentMethod === 'HISSELI' ? {
        firstName: order.installmentFirstName,
        lastName: order.installmentLastName,
        fatherName: order.installmentFatherName,
        idCardFront: order.installmentIdCardFront,
        idCardBack: order.installmentIdCardBack,
        registrationAddress: order.installmentRegAddress,
        actualAddress: order.installmentActualAddress,
        cityNumber: order.installmentCityNumber,
        familyMembers: order.installmentFamilyMembers ? JSON.parse(order.installmentFamilyMembers) : null,
        workplace: order.installmentWorkplace,
        position: order.installmentPosition,
        salary: order.installmentSalary
      } : null
    }))

    return NextResponse.json(formattedOrders)
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== ORDERS API POST REQUEST START ===')
    console.log('Request received at:', new Date().toISOString())
    
    const session = await getServerSession(authOptions)
    console.log('Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })
    
    if (!session?.user?.email) {
      console.log('Unauthorized access - no session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('=== ORDER CREATION REQUEST ===')
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { 
      userId, 
      totalAmount, 
      paymentMethod, 
      notes, 
      orderItems, 
      shippingAddressId, 
      billingAddressId,
      // Hissəli ödəniş məlumatları
      installmentData
    } = body

    console.log('Payment method:', paymentMethod)
    console.log('Installment data:', installmentData)

    // Check if user has any PENDING orders that can be reused
    console.log('Checking for existing pending orders for user:', userId)
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

    console.log('Existing pending order found:', !!existingPendingOrder)
    if (existingPendingOrder) {
      console.log('Existing order details:', {
        id: existingPendingOrder.id,
        orderNumber: existingPendingOrder.orderNumber,
        itemsCount: existingPendingOrder.orderItems.length
      })
    }

    let order

    if (existingPendingOrder) {
      console.log('Reusing existing pending order:', existingPendingOrder.orderNumber)
      
      // Update existing order with new data
      const updateData: any = {
        totalAmount,
        paymentMethod,
        notes,
        shippingAddressId,
        billingAddressId,
        updatedAt: new Date()
      }

      // Add installment data if payment method is HISSELI
      if (paymentMethod === 'HISSELI' && installmentData) {
        console.log('Adding installment data to existing order update')
        console.log('Installment data to save:', installmentData)
        
        updateData.installmentFirstName = installmentData.firstName
        updateData.installmentLastName = installmentData.lastName
        updateData.installmentFatherName = installmentData.fatherName
        updateData.installmentIdCardFront = installmentData.idCardFrontUrl
        updateData.installmentIdCardBack = installmentData.idCardBackUrl
        updateData.installmentRegAddress = installmentData.registrationAddress
        updateData.installmentActualAddress = installmentData.actualAddress
        updateData.installmentCityNumber = installmentData.cityNumber
        updateData.installmentFamilyMembers = JSON.stringify(installmentData.familyMembers)
        updateData.installmentWorkplace = installmentData.workplace
        updateData.installmentPosition = installmentData.position
        updateData.installmentSalary = installmentData.salary
        
        console.log('Update data with installment:', updateData)
      }

      console.log('Updating existing order with data:', updateData)
      order = await prisma.order.update({
        where: { id: existingPendingOrder.id },
        data: updateData,
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

      const createData: any = {
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
      }

      // Add installment data if payment method is HISSELI
      if (paymentMethod === 'HISSELI' && installmentData) {
        console.log('Adding installment data to new order creation')
        console.log('Installment data to save:', installmentData)
        
        createData.installmentFirstName = installmentData.firstName
        createData.installmentLastName = installmentData.lastName
        createData.installmentFatherName = installmentData.fatherName
        createData.installmentIdCardFront = installmentData.idCardFrontUrl
        createData.installmentIdCardBack = installmentData.idCardBackUrl
        createData.installmentRegAddress = installmentData.registrationAddress
        createData.installmentActualAddress = installmentData.actualAddress
        createData.installmentCityNumber = installmentData.cityNumber
        createData.installmentFamilyMembers = JSON.stringify(installmentData.familyMembers)
        createData.installmentWorkplace = installmentData.workplace
        createData.installmentPosition = installmentData.position
        createData.installmentSalary = installmentData.salary
        
        console.log('Create data with installment:', createData)
      }

      console.log('Creating new order with data:', createData)
      order = await prisma.order.create({
        data: createData,
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
    }

    console.log('=== ORDER CREATION SUCCESS ===')
    console.log('Order created/updated successfully:', {
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      status: order?.status,
      paymentMethod: order?.paymentMethod,
      totalAmount: order?.totalAmount,
      itemsCount: order?.orderItems?.length || 0
    })

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

    console.log('=== RETURNING ORDER RESPONSE ===')
    console.log('Final order object:', order ? {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod
    } : 'No order object')

    return NextResponse.json(order || {})
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===')
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    console.error('Full error object:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
