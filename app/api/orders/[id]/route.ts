import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
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
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format installment data if payment method is HISSELI
    let installmentData = null
    if (order.paymentMethod === 'HISSELI' && order.installmentFirstName) {
      installmentData = {
        firstName: order.installmentFirstName,
        lastName: order.installmentLastName,
        fatherName: order.installmentFatherName,
        idCardFront: order.installmentIdCardFront,
        idCardBack: order.installmentIdCardBack,
        registrationAddress: order.installmentRegAddress,
        actualAddress: order.installmentActualAddress,
        cityNumber: order.installmentCityNumber,
        familyMembers: order.installmentFamilyMembers ? JSON.parse(order.installmentFamilyMembers) : [],
        workplace: order.installmentWorkplace,
        position: order.installmentPosition,
        salary: order.installmentSalary
      }
    }

    console.log('=== ORDER DETAILS API ===')
    console.log('Order ID:', order.id)
    console.log('Payment Method:', order.paymentMethod)
    console.log('Has installment data:', !!installmentData)
    console.log('Installment data:', installmentData)

    const formattedOrder = {
      ...order,
      installmentData
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Order details fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    // Validate status values
    const validStatuses = ['PENDING', 'PAID', 'PAYMENT_FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED']
    const validPaymentStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: params.id,
        user: {
          email: session.user.email
        }
      },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date()
      }
    })

    console.log('Order status updated:', updatedOrder.id, 'Status:', status, 'Payment Status:', paymentStatus)

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
