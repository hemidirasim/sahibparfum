const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDiorProducts() {
  try {
    const diorBrandId = 'cmfh15i4u0001prlribzdkmgw';
    
    // Category mappings
    const categoryMap = {
      'Qadın Parfümləri': 'cmfgxp8010002n9pp4tfbsvf7',
      'Kişi Parfümləri': 'cmfgxp72q0000n9ppt62s9mw7',
      'Lüks Parfümlər': 'cmfh16pv90000y15ku7gp6bxw',
      'Unisex Parfümlər': 'cmfgxp7zl0001n9ppz3ae1slm'
    };

    const diorProducts = [
      {
        name: 'Dior Sauvage',
        description: 'Kişilər üçün müasir və cəsarətli parfüm. Kəndir və qara bibər notları ilə.',
        price: 280,
        salePrice: 250,
        images: '/images/products/dior-sauvage.jpg',
        brandId: diorBrandId,
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 12,
        sku: 'DIOR-SAV-001',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Dior Homme Intense',
        description: 'Kişilər üçün zərif və sofistike parfüm. Iris və ambra notları ilə.',
        price: 320,
        salePrice: null,
        images: '/images/products/dior-homme-intense.jpg',
        brandId: diorBrandId,
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 8,
        sku: 'DIOR-HOM-002',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Miss Dior',
        description: 'Qadınlar üçün romantik və zərif parfüm. Qızılgül və jasmine notları ilə.',
        price: 350,
        salePrice: 320,
        images: '/images/products/miss-dior.jpg',
        brandId: diorBrandId,
        categoryId: categoryMap['Qadın Parfümləri'],
        stockCount: 15,
        sku: 'DIOR-MISS-003',
        isActive: true,
        isNew: false,
        isOnSale: true
      },
      {
        name: 'Dior J\'adore',
        description: 'Qadınlar üçün klassik və lüks parfüm. Qızılgül və yasemin notları ilə.',
        price: 420,
        salePrice: null,
        images: '/images/products/dior-jadore.jpg',
        brandId: diorBrandId,
        categoryId: categoryMap['Lüks Parfümlər'],
        stockCount: 6,
        sku: 'DIOR-JAD-004',
        isActive: true,
        isNew: true,
        isOnSale: false
      },
      {
        name: 'Dior Fahrenheit',
        description: 'Kişilər üçün unikal və qeyri-adi parfüm. Benzin və metal notları ilə.',
        price: 290,
        salePrice: 260,
        images: '/images/products/dior-fahrenheit.jpg',
        brandId: diorBrandId,
        categoryId: categoryMap['Kişi Parfümləri'],
        stockCount: 10,
        sku: 'DIOR-FAH-005',
        isActive: true,
        isNew: false,
        isOnSale: true
      }
    ];

    console.log('Dior məhsulları əlavə edilir...');

    for (const product of diorProducts) {
      const existingProduct = await prisma.product.findFirst({
        where: { sku: product.sku }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: product
        });
        console.log(`✅ ${product.name} əlavə edildi`);
      } else {
        console.log(`⚠️ ${product.name} artıq mövcuddur`);
      }
    }

    console.log('🎉 Dior məhsulları uğurla əlavə edildi!');
  } catch (error) {
    console.error('❌ Xəta: Məhsullar əlavə edilərkən xəta baş verdi', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDiorProducts();
