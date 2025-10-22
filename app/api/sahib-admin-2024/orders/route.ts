import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { guestName: { contains: search } },
        { guestEmail: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus
    }

    // Get orders with user and items
    const orders = await prisma.order.findMany({
      where,
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
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count for pagination
    const total = await prisma.order.count({ where })

    // Format orders
    const formattedOrders = orders.map(order => {
      
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
      
      
      return {
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
            image: (() => {
              try {
                const images = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images
                return images && images.length > 0 ? images[0] : '/placeholder-product.jpg'
              } catch {
                return '/placeholder-product.jpg'
              }
            })()
          }
        })),
        itemCount: order.orderItems.length,
        shippingAddress: order.shippingAddress ? {
          id: order.shippingAddress.id,
          fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          address: order.shippingAddress.address1 + (order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''),
          city: order.shippingAddress.city,
          postalCode: order.shippingAddress.postalCode,
          phone: order.shippingAddress.phone || ''
        } : null,
        billingAddress: order.billingAddress ? {
          id: order.billingAddress.id,
          fullName: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
          address: order.billingAddress.address1 + (order.billingAddress.address2 ? `, ${order.billingAddress.address2}` : ''),
          city: order.billingAddress.city,
          postalCode: order.billingAddress.postalCode,
          phone: order.billingAddress.phone || ''
        } : null,
        notes: order.notes,
        // Hissəli ödəniş məlumatları
        installmentData,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

    formattedOrders.forEach((order, index) => {
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        hasInstallmentData: !!order.installmentData,
        installmentData: order.installmentData
      })
    })
    
    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
