const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@sahibparfumeriya.az'
      }
    })

    if (existingAdmin) {
      console.log('Admin hesabı artıq mövcuddur!')
      console.log('Email:', existingAdmin.email)
      console.log('Rol:', existingAdmin.role)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@sahibparfumeriya.az',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin hesabı uğurla yaradıldı!')
    console.log('Email:', admin.email)
    console.log('Şifrə:', 'admin123')
    console.log('Rol:', admin.role)

  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
