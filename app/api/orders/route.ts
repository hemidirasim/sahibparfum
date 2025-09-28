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
    const formattedOrders = orders.map(order => {
      console.log('=== ORDER FORMATTING ===')
      console.log('Order ID:', order.id)
      console.log('Payment Method:', order.paymentMethod)
      console.log('Installment First Name:', order.installmentFirstName)
      console.log('Installment Last Name:', order.installmentLastName)
      console.log('Installment Father Name:', order.installmentFatherName)
      console.log('Installment Workplace:', order.installmentWorkplace)
      console.log('Installment Salary:', order.installmentSalary)
      console.log('Installment Family Members:', order.installmentFamilyMembers)
      
      const installmentData = order.paymentMethod === 'HISSELI' ? {
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
      
      console.log('Formatted Installment Data:', installmentData)
      
      return {
        ...order,
        installmentData
      }
    })

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
      userRole: session?.user?.role,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    })
    
    if (!session?.user?.email) {
      console.log('Unauthorized access - no session or email')
      console.log('Session object:', session)
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
    
    // Validate required fields
    if (!userId) {
      console.error('Missing userId')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    if (!totalAmount || totalAmount <= 0) {
      console.error('Invalid totalAmount:', totalAmount)
      return NextResponse.json({ error: 'Valid total amount is required' }, { status: 400 })
    }
    
    if (!paymentMethod) {
      console.error('Missing paymentMethod')
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }
    
    if (!orderItems || orderItems.length === 0) {
      console.error('Missing or empty orderItems')
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }
    
    console.log('All validations passed')
    
    // Test database connection first
    try {
      const testConnection = await prisma.user.count()
      console.log('Database connection test - user count:', testConnection)
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // Always create new order - no reuse of pending orders
    console.log('Creating new order - no pending order reuse')
    
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

    console.log('=== CREATING NEW ORDER ===')
    console.log('Create data:', createData)
    
    const order = await prisma.order.create({
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
