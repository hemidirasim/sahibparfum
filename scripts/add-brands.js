const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const brands = [
  {
    name: 'Chanel',
    description: 'Fransız lüks parfüm markası',
    logo: '/images/brands/chanel-logo.png',
    isActive: true
  },
  {
    name: 'Dior',
    description: 'Fransız lüks parfüm və kosmetik markası',
    logo: '/images/brands/dior-logo.png',
    isActive: true
  },
  {
    name: 'Versace',
    description: 'İtaliya lüks parfüm markası',
    logo: '/images/brands/versace-logo.png',
    isActive: true
  },
  {
    name: 'Armani',
    description: 'İtaliya lüks parfüm markası',
    logo: '/images/brands/armani-logo.png',
    isActive: true
  },
  {
    name: 'Tom Ford',
    description: 'Amerika lüks parfüm markası',
    logo: '/images/brands/tom-ford-logo.png',
    isActive: true
  },
  {
    name: 'Yves Saint Laurent',
    description: 'Fransız lüks parfüm markası',
    logo: '/images/brands/ysl-logo.png',
    isActive: true
  },
  {
    name: 'Giorgio Armani',
    description: 'İtaliya lüks parfüm markası',
    logo: '/images/brands/giorgio-armani-logo.png',
    isActive: true
  },
  {
    name: 'Prada',
    description: 'İtaliya lüks parfüm markası',
    logo: '/images/brands/prada-logo.png',
    isActive: true
  },
  {
    name: 'Gucci',
    description: 'İtaliya lüks parfüm markası',
    logo: '/images/brands/gucci-logo.png',
    isActive: true
  },
  {
    name: 'Hermès',
    description: 'Fransız lüks parfüm markası',
    logo: '/images/brands/hermes-logo.png',
    isActive: true
  },
  {
    name: 'Creed',
    description: 'Fransız lüks parfüm markası',
    logo: '/images/brands/creed-logo.png',
    isActive: true
  },
  {
    name: 'Maison Margiela',
    description: 'Belçika lüks parfüm markası',
    logo: '/images/brands/maison-margiela-logo.png',
    isActive: true
  }
];

async function addBrands() {
  try {
    console.log('Brand-lar əlavə edilir...');
    
    for (const brandData of brands) {
      const existingBrand = await prisma.brand.findFirst({
        where: { name: brandData.name }
      });
      
      if (!existingBrand) {
        await prisma.brand.create({
          data: brandData
        });
        console.log(`✅ ${brandData.name} əlavə edildi`);
      } else {
        console.log(`⚠️ ${brandData.name} artıq mövcuddur`);
      }
    }
    
    console.log('🎉 Bütün brand-lar uğurla əlavə edildi!');
    
    // Brand sayını göstər
    const brandCount = await prisma.brand.count();
    console.log(`📊 Cəmi brand sayı: ${brandCount}`);
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBrands();
