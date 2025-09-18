const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTransactionIdColumn() {
  try {
    console.log('Adding transactionId column to orders table...')
    
    // Check if column already exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'transactionId'
    `
    
    if (result.length > 0) {
      console.log('transactionId column already exists!')
      return
    }
    
    // Add the column
    await prisma.$queryRaw`
      ALTER TABLE "orders" ADD COLUMN "transactionId" INTEGER
    `
    
    console.log('✅ transactionId column added successfully!')
    
    // Add index
    await prisma.$queryRaw`
      CREATE INDEX "orders_transactionId_idx" ON "orders"("transactionId")
    `
    
    console.log('✅ Index created successfully!')
    
  } catch (error) {
    console.error('❌ Error adding transactionId column:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addTransactionIdColumn()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
