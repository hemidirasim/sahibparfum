import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Starting user reset process...')

    // Delete all users (this will cascade delete related data)
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`✅ Deleted ${deletedUsers.count} users`)

    // Delete related data
    await prisma.cart.deleteMany({})
    await prisma.address.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.productRating.deleteMany({})
    await prisma.favorite.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.session.deleteMany({})
    await prisma.account.deleteMany({})

    console.log('✅ All user-related data deleted')

    // Create new admin user with hashed password
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sahibparfum.az',
        name: 'Admin',
        password: await bcrypt.hash('admin123', 12),
        role: 'ADMIN',
        isActive: true
      }
    })

    // Create cart for admin
    await prisma.cart.create({
      data: {
        userId: admin.id,
      }
    })

    console.log('✅ Admin user created successfully')

    return NextResponse.json({
      success: true,
      message: 'Bütün user-lər silindi və admin yenidən yaradıldı',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('❌ User reset error:', error)
    return NextResponse.json(
      { error: 'User reset zamanı xəta baş verdi' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
