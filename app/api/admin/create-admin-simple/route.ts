import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Creating admin user...')

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@sahibparfum.az',
        role: 'ADMIN'
      }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin artıq mövcuddur',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('qw2e3Q!W@E', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sahibparfum.az',
        password: hashedPassword,
        name: 'Admin',
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

    console.log('Admin user created successfully')

    return NextResponse.json({
      success: true,
      message: 'Admin uğurla yaradıldı',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { 
        error: 'Admin yaratmaq zamanı xəta baş verdi',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
