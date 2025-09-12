const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@sahib.az' }
    })

    if (existingAdmin) {
      // Update existing user to admin role
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@sahib.az' },
        data: { role: 'ADMIN' }
      })
      console.log('✅ Mövcud istifadəçi admin roluna yüksəldildi:')
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Role: ${updatedUser.role}`)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sahib.az',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Admin istifadəçisi yaradıldı:')
    console.log(`   Email: admin@sahib.az`)
    console.log(`   Şifrə: admin123`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   ID: ${admin.id}`)
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
