const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Database yoxlanılır...')
    
    const categories = await prisma.category.findMany()
    console.log('📁 Kateqoriyalar:')
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`)
    })
    
    const brands = await prisma.brand.findMany()
    console.log('🏷️ Brendlər:')
    brands.forEach(brand => {
      console.log(`  - ${brand.name}`)
    })
    
    const products = await prisma.product.findMany()
    console.log('📦 Məhsullar:')
    products.forEach(product => {
      console.log(`  - ${product.name}`)
    })
    
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
