const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleProducts() {
  try {
    console.log('Yeni məhsullar əlavə edilir...');
    
    // Brand və Category ID-lərini al
    const brands = await prisma.brand.findMany();
    const categories = await prisma.category.findMany();
    
    console.log(`📊 Mövcud brand sayı: ${brands.length}`);
    console.log(`📊 Mövcud kateqoriya sayı: ${categories.length}`);
    
    // Brand və Category mapping
    const brandMap = {};
    brands.forEach(brand => {
      brandMap[brand.name] = brand.id;
    });
    
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name] = category.id;
    });
    
    const products = [
      {
        name: 'Chanel No. 5',
        description: 'Klassik qadın parfümü - ən məşhur parfümlərdən biri',
        price: 450,
        salePrice: 380,
        images: '/images/products/chanel-no5.jpg',
        brandId: brandMap['Chanel'],
        categoryId: categoryMap['Qadın Parfümləri'],
        stockCount: 15,
        sku: 'CHANEL-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Dior Sauvage',
        description: 'Kişilər üçün məşhur parfüm - güclü və cəzbedici',
        price: 380,
        salePrice: null,
        images: '/images/products/dior-sauvage.jpg',
        brandId: brandMap['Dior'],
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 20,
        sku: 'DIOR-001',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Versace Eros',
        description: 'Kişilər üçün lüks parfüm - romantik və güclü',
        price: 320,
        salePrice: 280,
        images: '/images/products/versace-eros.jpg',
        brandId: brandMap['Versace'],
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 12,
        sku: 'VERSACE-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Armani Code',
        description: 'Kişilər üçün klassik parfüm - zərif və cazibədar',
        price: 350,
        salePrice: null,
        images: '/images/products/armani-code.jpg',
        brandId: brandMap['Armani'],
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 18,
        sku: 'ARMANI-001',
        isActive: true,
        isNew: false,
        isOnSale: false
      },
      {
        name: 'Tom Ford Black Orchid',
        description: 'Qadınlar üçün lüks parfüm - mistik və cazibədar',
        price: 520,
        salePrice: 450,
        images: '/images/products/tom-ford-black-orchid.jpg',
        brandId: brandMap['Tom Ford'],
        categoryId: categoryMap['Lüks Parfümlər'],
        stockCount: 8,
        sku: 'TOM-FORD-001',
        isActive: true,
        isNew: true,
        isOnSale: true
      },
      {
        name: 'YSL Libre',
        description: 'Qadınlar üçün müasir parfüm - azadlıq və güc',
        price: 420,
        salePrice: null,
        images: '/images/products/ysl-libre.jpg',
        brandId: brandMap['Yves Saint Laurent'],
        categoryId: categoryMap['Qadın Parfümləri'],
        stockCount: 14,
        sku: 'YSL-001',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Giorgio Armani Si',
        description: 'Qadınlar üçün lüks parfüm - qadın gücü və zəriflik',
        price: 480,
        salePrice: 420,
        images: '/images/products/giorgio-armani-si.jpg',
        brandId: brandMap['Giorgio Armani'],
        categoryId: categoryMap['Lüks Parfümlər'],
        stockCount: 10,
        sku: 'G-ARMANI-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Prada Luna Rossa',
        description: 'Kişilər üçün sport parfüm - enerji və hərəkət',
        price: 380,
        salePrice: null,
        images: '/images/products/prada-luna-rossa.jpg',
        brandId: brandMap['Prada'],
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 16,
        sku: 'PRADA-001',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Gucci Bloom',
        description: 'Qadınlar üçün çiçək əsaslı parfüm - təbii və romantik',
        price: 450,
        salePrice: 380,
        images: '/images/products/gucci-bloom.jpg',
        brandId: brandMap['Gucci'],
        categoryId: categoryMap['Təbii Parfümlər'],
        stockCount: 13,
        sku: 'GUCCI-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Hermès Terre d\'Hermès',
        description: 'Kişilər üçün təbii parfüm - torpaq və təbiət',
        price: 550,
        salePrice: null,
        images: '/images/products/hermes-terre.jpg',
        brandId: brandMap['Hermès'],
        categoryId: categoryMap['Təbii Parfümlər'],
        stockCount: 7,
        sku: 'HERMES-001',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Creed Aventus',
        description: 'Kişilər üçün lüks parfüm - qalibiyyət və güc',
        price: 680,
        salePrice: 580,
        images: '/images/products/creed-aventus.jpg',
        brandId: brandMap['Creed'],
        categoryId: categoryMap['Lüks Parfümlər'],
        stockCount: 5,
        sku: 'CREED-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Maison Margiela Replica',
        description: 'Unisex parfüm - xatirələr və emosiyalar',
        price: 420,
        salePrice: null,
        images: '/images/products/maison-margiela-replica.jpg',
        brandId: brandMap['Maison Margiela'],
        categoryId: categoryMap['Unisex Parfümlər'],
        stockCount: 11,
        sku: 'M-MARGIELA-001',
        isActive: true,
        isNew: true,
        isOnSale: false
      }
    ];
    
    for (const productData of products) {
      // Məhsulun mövcudluğunu yoxla
      const existingProduct = await prisma.product.findFirst({
        where: { sku: productData.sku }
      });
      
      if (!existingProduct) {
        await prisma.product.create({
          data: productData
        });
        console.log(`✅ ${productData.name} əlavə edildi`);
      } else {
        console.log(`⚠️ ${productData.name} artıq mövcuddur`);
      }
    }
    
    console.log('🎉 Bütün məhsullar uğurla əlavə edildi!');
    
    // Məhsul sayını göstər
    const productCount = await prisma.product.count();
    console.log(`📊 Cəmi məhsul sayı: ${productCount}`);
    
    // Kateqoriya üzrə məhsul saylarını göstər
    const categoryStats = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 Kateqoriya üzrə məhsul sayları:');
    for (const stat of categoryStats) {
      const category = categories.find(c => c.id === stat.categoryId);
      console.log(`  ${category?.name}: ${stat._count.id} məhsul`);
    }
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts();