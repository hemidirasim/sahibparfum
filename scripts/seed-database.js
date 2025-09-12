const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('🌱 Database seeding başlayır...')

    // 1. Kateqoriyalar yarat
    console.log('📁 Kateqoriyalar yaradılır...')
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Kişi Parfümü',
          description: 'Kişilər üçün parfümlər',
          image: 'https://i.ibb.co/example/men-perfume.jpg',
          isActive: true
        }
      }),
      prisma.category.create({
        data: {
          name: 'Qadın Parfümü',
          description: 'Qadınlar üçün parfümlər',
          image: 'https://i.ibb.co/example/women-perfume.jpg',
          isActive: true
        }
      }),
      prisma.category.create({
        data: {
          name: 'Unisex Parfüm',
          description: 'Hər kəs üçün parfümlər',
          image: 'https://i.ibb.co/example/unisex-perfume.jpg',
          isActive: true
        }
      })
    ])

    console.log(`✅ ${categories.length} kateqoriya yaradıldı`)

    // 2. Brendlər yarat
    console.log('🏷️ Brendlər yaradılır...')
    const brands = await Promise.all([
      prisma.brand.create({
        data: {
          name: 'Chanel',
          description: 'Fransız lüks parfüm brendi',
          logo: 'https://i.ibb.co/example/chanel-logo.png',
          isActive: true
        }
      }),
      prisma.brand.create({
        data: {
          name: 'Dior',
          description: 'Fransız lüks parfüm brendi',
          logo: 'https://i.ibb.co/example/dior-logo.png',
          isActive: true
        }
      }),
      prisma.brand.create({
        data: {
          name: 'Versace',
          description: 'İtaliya lüks parfüm brendi',
          logo: 'https://i.ibb.co/example/versace-logo.png',
          isActive: true
        }
      }),
      prisma.brand.create({
        data: {
          name: 'Armani',
          description: 'İtaliya lüks parfüm brendi',
          logo: 'https://i.ibb.co/example/armani-logo.png',
          isActive: true
        }
      })
    ])

    console.log(`✅ ${brands.length} brend yaradıldı`)

    // 3. Məhsullar yarat
    console.log('🛍️ Məhsullar yaradılır...')
    const products = await Promise.all([
      // Kişi parfümləri
      prisma.product.create({
        data: {
          name: 'Chanel Bleu de Chanel',
          description: 'Kişilər üçün klassik parfüm',
          price: 120.00,
          salePrice: 100.00,
          images: 'https://i.ibb.co/example/bleu-chanel.jpg',
          inStock: true,
          stockCount: 50,
          sku: 'CHANEL-BLEU-100ML',
          brandId: brands[0].id,
          volume: '100ml',
          categoryId: categories[0].id,
          isNew: true,
          isOnSale: true,
          isActive: true
        }
      }),
      prisma.product.create({
        data: {
          name: 'Dior Sauvage',
          description: 'Kişilər üçün müasir parfüm',
          price: 95.00,
          images: 'https://i.ibb.co/example/sauvage.jpg',
          inStock: true,
          stockCount: 30,
          sku: 'DIOR-SAUVAGE-100ML',
          brandId: brands[1].id,
          volume: '100ml',
          categoryId: categories[0].id,
          isNew: false,
          isOnSale: false,
          isActive: true
        }
      }),
      // Qadın parfümləri
      prisma.product.create({
        data: {
          name: 'Chanel No. 5',
          description: 'Qadınlar üçün klassik parfüm',
          price: 150.00,
          salePrice: 130.00,
          images: 'https://i.ibb.co/example/chanel-no5.jpg',
          inStock: true,
          stockCount: 25,
          sku: 'CHANEL-NO5-100ML',
          brandId: brands[0].id,
          volume: '100ml',
          categoryId: categories[1].id,
          isNew: false,
          isOnSale: true,
          isActive: true
        }
      }),
      prisma.product.create({
        data: {
          name: 'Dior J\'adore',
          description: 'Qadınlar üçün zərif parfüm',
          price: 110.00,
          images: 'https://i.ibb.co/example/jadore.jpg',
          inStock: true,
          stockCount: 40,
          sku: 'DIOR-JADORE-100ML',
          brandId: brands[1].id,
          volume: '100ml',
          categoryId: categories[1].id,
          isNew: true,
          isOnSale: false,
          isActive: true
        }
      }),
      // Unisex parfümlər
      prisma.product.create({
        data: {
          name: 'Versace Eros',
          description: 'Hər kəs üçün parfüm',
          price: 85.00,
          images: 'https://i.ibb.co/example/eros.jpg',
          inStock: true,
          stockCount: 35,
          sku: 'VERSACE-EROS-100ML',
          brandId: brands[2].id,
          volume: '100ml',
          categoryId: categories[2].id,
          isNew: true,
          isOnSale: false,
          isActive: true
        }
      })
    ])

    console.log(`✅ ${products.length} məhsul yaradıldı`)

    // 4. Slayderlər yarat
    console.log('🎠 Slayderlər yaradılır...')
    const sliders = await Promise.all([
      prisma.slider.create({
        data: {
          title: 'Yeni Koleksiya',
          subtitle: '2024 Parfüm Koleksiyası',
          description: 'Ən yeni və ən məşhur parfümləri kəşf edin',
          image: 'https://i.ibb.co/example/slider1.jpg',
          link: '/products?filter=new',
          buttonText: 'Kəşf Et',
          isActive: true,
          order: 1
        }
      }),
      prisma.slider.create({
        data: {
          title: 'Endirimlər',
          subtitle: '50% Endirim',
          description: 'Seçilmiş parfümlərdə böyük endirimlər',
          image: 'https://i.ibb.co/example/slider2.jpg',
          link: '/products?filter=sale',
          buttonText: 'Alış-veriş Et',
          isActive: true,
          order: 2
        }
      })
    ])

    console.log(`✅ ${sliders.length} slayder yaradıldı`)

    // 5. Test istifadəçisi yarat
    console.log('👤 Test istifadəçisi yaradılır...')
    const hashedPassword = await bcrypt.hash('test123', 12)
    const testUser = await prisma.user.create({
      data: {
        name: 'Test İstifadəçi',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true
      }
    })

    console.log(`✅ Test istifadəçisi yaradıldı: ${testUser.email}`)

    console.log('🎉 Database seeding tamamlandı!')
    console.log('')
    console.log('📊 Yaradılan məlumatlar:')
    console.log(`• ${categories.length} kateqoriya`)
    console.log(`• ${brands.length} brend`)
    console.log(`• ${products.length} məhsul`)
    console.log(`• ${sliders.length} slayder`)
    console.log('• 1 test istifadəçisi')
    console.log('• 1 admin istifadəçisi')
    console.log('')
    console.log('🔑 Giriş məlumatları:')
    console.log('Admin: admin@parfum.az / admin123')
    console.log('Test: test@example.com / test123')

  } catch (error) {
    console.error('❌ Seeding xətası:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()
