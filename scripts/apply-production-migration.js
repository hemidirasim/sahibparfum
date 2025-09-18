const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function applyMigration() {
  try {
    console.log('🔄 Applying password reset fields migration...')
    
    // Check if columns already exist
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('resetToken', 'resetTokenExpiry')
    `
    
    if (result.length === 2) {
      console.log('✅ Password reset fields already exist!')
      return
    }
    
    // Add resetToken column
    await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;`
    console.log('✅ Added resetToken column')
    
    // Add resetTokenExpiry column  
    await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);`
    console.log('✅ Added resetTokenExpiry column')
    
    // Add index
    await prisma.$executeRaw`CREATE INDEX "users_resetToken_idx" ON "users"("resetToken");`
    console.log('✅ Added resetToken index')
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
