const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  { name: 'Qadın Ətri', slug: 'qadin-etri', description: 'Qadınlar üçün ətirlər' },
  { name: 'Kişi Ətri', slug: 'kisi-etri', description: 'Kişilər üçün ətirlər' },
  { name: 'Unisex Ətri', slug: 'unisex-etri', description: 'Hər kəs üçün ətirlər' }
]

const brands = [
  { name: 'Chanel', description: 'Fransız lüks brendi' },
  { name: 'Dior', description: 'Fransız moda evi' },
  { name: 'YSL', description: 'Yves Saint Laurent' },
  { name: 'Tom Ford', description: 'Amerikan dizayner brendi' },
  { name: 'Versace', description: 'İtaliya lüks brendi' }
]

async function addCategoriesAndBrands() {
  try {
    console.log('🔄 Kateqoriyalar əlavə edilir...')
    
    for (const category of categories) {
      try {
        await prisma.category.create({
          data: category
        })
        console.log(`✅ ${category.name} kateqoriyası əlavə edildi`)
      } catch (error) {
        console.log(`ℹ️ ${category.name} kateqoriyası artıq mövcuddur`)
      }
    }

    console.log('🔄 Brendlər əlavə edilir...')
    
    for (const brand of brands) {
      try {
        await prisma.brand.create({
          data: brand
        })
        console.log(`✅ ${brand.name} brendi əlavə edildi`)
      } catch (error) {
        console.log(`ℹ️ ${brand.name} brendi artıq mövcuddur`)
      }
    }

    console.log('🎉 Kateqoriyalar və brendlər əlavə edildi!')
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addCategoriesAndBrands()
