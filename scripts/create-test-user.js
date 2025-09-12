const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@sahib.az' }
    })

    if (existingUser) {
      console.log('✅ Test istifadəçisi artıq mövcuddur')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@sahib.az',
        name: 'Admin User',
        password: hashedPassword,
        role: 'USER',
        isActive: true
      }
    })

    console.log('✅ Test istifadəçisi yaradıldı:')
    console.log(`   Email: admin@sahib.az`)
    console.log(`   Şifrə: admin123`)
    console.log(`   ID: ${user.id}`)
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
