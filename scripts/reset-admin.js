const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdmin() {
  try {
    // Delete existing admin
    await prisma.user.deleteMany({
      where: {
        email: 'admin@sahibparfumeriya.az'
      }
    })

    console.log('✅ Köhnə admin hesabı silindi')

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@sahibparfumeriya.az',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Yeni admin hesabı uğurla yaradıldı!')
    console.log('Email:', admin.email)
    console.log('Şifrə:', 'admin123')
    console.log('Rol:', admin.role)

  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdmin()
