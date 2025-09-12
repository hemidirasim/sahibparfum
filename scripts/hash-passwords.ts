import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashExistingPasswords() {
  try {
    console.log('🔐 Starting password hashing process...')

    // Get all users with plain text passwords
    const users = await prisma.user.findMany({
      where: {
        password: {
          not: null
        }
      }
    })

    console.log(`Found ${users.length} users to process`)

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password && !user.password.startsWith('$2')) {
        console.log(`Hashing password for user: ${user.email}`)
        
        const hashedPassword = await bcrypt.hash(user.password, 12)
        
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })
        
        console.log(`✅ Password hashed for: ${user.email}`)
      } else {
        console.log(`⏭️  Password already hashed for: ${user.email}`)
      }
    }

    console.log('🎉 Password hashing completed!')

  } catch (error) {
    console.error('❌ Error hashing passwords:', error)
  } finally {
    await prisma.$disconnect()
  }
}

hashExistingPasswords()
