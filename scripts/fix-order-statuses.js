const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixOrderStatuses() {
  try {
    console.log('Starting to fix order statuses...')
    
    // Find all orders that have transactionId but status is still PENDING
    const ordersToUpdate = await prisma.order.findMany({
      where: {
        transactionId: {
          not: null
        },
        status: 'PENDING'
      },
      select: {
        id: true,
        orderNumber: true,
        transactionId: true,
        status: true,
        paymentStatus: true
      }
    })

    console.log(`Found ${ordersToUpdate.length} orders to update`)

    for (const order of ordersToUpdate) {
      console.log(`Updating order ${order.orderNumber} (ID: ${order.id})`)
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Updated order ${order.orderNumber} to PAID`)
    }

    // Also find orders that might have been paid but have different statuses
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        transactionId: true,
        status: true,
        paymentStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\nAll orders status summary:')
    for (const order of allOrders) {
      console.log(`${order.orderNumber}: ${order.status}/${order.paymentStatus} (TransactionId: ${order.transactionId || 'None'})`)
    }

    console.log('\n✅ Order status fix completed!')
    
  } catch (error) {
    console.error('Error fixing order statuses:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixOrderStatuses()
