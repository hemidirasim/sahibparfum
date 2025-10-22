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

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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

    // Format order
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.user?.name || order.guestName || 'Qonaq',
      email: order.user?.email || order.guestEmail,
      phone: order.guestPhone,
      amount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: {
          name: item.product.name,
          sku: item.product.sku,
          image: item.product.images[0] || '/images/placeholder.jpg'
        }
      })),
      itemCount: order.orderItems.length,
      shippingAddress: order.shippingAddress ? {
        id: order.shippingAddress.id,
        fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address: `${order.shippingAddress.address1}${order.shippingAddress.address2 ? ', ' + order.shippingAddress.address2 : ''}`,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        phone: order.shippingAddress.phone
      } : null,
      billingAddress: order.billingAddress ? {
        id: order.billingAddress.id,
        fullName: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
        address: `${order.billingAddress.address1}${order.billingAddress.address2 ? ', ' + order.billingAddress.address2 : ''}`,
        city: order.billingAddress.city,
        postalCode: order.billingAddress.postalCode,
        phone: order.billingAddress.phone
      } : null,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
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


    const finalOrder = {
      ...formattedOrder,
      installmentData
    }

    return NextResponse.json(finalOrder)
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

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentStatus } = body

    if (!status && !paymentStatus) {
      return NextResponse.json({ error: 'Status or paymentStatus is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const order = await prisma.order.update({
      where: { id: params.id },
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
