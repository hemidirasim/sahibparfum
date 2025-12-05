import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = 'admin@sahibparfum.az'
    const password = 'Admin123!'
    const name = 'Admin User'

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    })

    if (existingAdmin) {
      console.log('Admin istifadəçi artıq mövcuddur!')
      console.log('Email:', email)
      console.log('Parol:', password)
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      })
      console.log('Admin parolu yeniləndi!')
      return
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Admin istifadəçi uğurla yaradıldı!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', email)
    console.log('🔑 Parol:', password)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  Xahiş edirik parolu dəyişdirin!')
    
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()

