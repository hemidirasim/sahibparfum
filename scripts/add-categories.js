const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Kişi Parfümləri',
    description: 'Kişilər üçün parfüm kolleksiyası',
    image: '/images/categories/men-perfume.jpg',
    isActive: true
  },
  {
    name: 'Qadın Parfümləri',
    description: 'Qadınlar üçün parfüm kolleksiyası',
    image: '/images/categories/women-perfume.jpg',
    isActive: true
  },
  {
    name: 'Unisex Parfümlər',
    description: 'Hər iki cins üçün parfüm kolleksiyası',
    image: '/images/categories/unisex-perfume.jpg',
    isActive: true
  },
  {
    name: 'Lüks Parfümlər',
    description: 'Lüks parfüm kolleksiyası',
    image: '/images/categories/luxury-perfume.jpg',
    isActive: true
  },
  {
    name: 'Təbii Parfümlər',
    description: 'Təbii əsaslı parfüm kolleksiyası',
    image: '/images/categories/natural-perfume.jpg',
    isActive: true
  },
  {
    name: 'Yay Parfümləri',
    description: 'Yay mövsümü üçün parfüm kolleksiyası',
    image: '/images/categories/summer-perfume.jpg',
    isActive: true
  },
  {
    name: 'Qış Parfümləri',
    description: 'Qış mövsümü üçün parfüm kolleksiyası',
    image: '/images/categories/winter-perfume.jpg',
    isActive: true
  },
  {
    name: 'Gündəlik Parfümlər',
    description: 'Gündəlik istifadə üçün parfüm kolleksiyası',
    image: '/images/categories/daily-perfume.jpg',
    isActive: true
  }
];

async function addCategories() {
  try {
    console.log('Kateqoriyalar əlavə edilir...');
    
    for (const categoryData of categories) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: categoryData.name }
      });
      
      if (!existingCategory) {
        await prisma.category.create({
          data: categoryData
        });
        console.log(`✅ ${categoryData.name} əlavə edildi`);
      } else {
        console.log(`⚠️ ${categoryData.name} artıq mövcuddur`);
      }
    }
    
    console.log('🎉 Bütün kateqoriyalar uğurla əlavə edildi!');
    
    // Kateqoriya sayını göstər
    const categoryCount = await prisma.category.count();
    console.log(`📊 Cəmi kateqoriya sayı: ${categoryCount}`);
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCategories();
