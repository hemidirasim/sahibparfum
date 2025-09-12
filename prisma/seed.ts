import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Kişi Parfümləri' },
      update: {},
      create: {
        name: 'Kişi Parfümləri',
        description: 'Kişilər üçün nəzərdə tutulmuş parfümlər',
        image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=400&h=400&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Qadın Parfümləri' },
      update: {},
      create: {
        name: 'Qadın Parfümləri',
        description: 'Qadınlar üçün nəzərdə tutulmuş parfümlər',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=400&h=400&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Unisex Parfümlər' },
      update: {},
      create: {
        name: 'Unisex Parfümlər',
        description: 'Həm kişilər, həm də qadınlar üçün uyğun parfümlər',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Mini Parfümlər' },
      update: {},
      create: {
        name: 'Mini Parfümlər',
        description: 'Kiçik həcmdə parfümlər',
        image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'CHN-001' },
      update: {},
      create: {
        name: 'Chanel N°5 Eau de Parfum',
        description: 'Chanel N°5 Eau de Parfum is the world\'s most famous fragrance. A timeless classic that embodies the essence of luxury and femininity.',
        price: 299.99,
        salePrice: 249.99,
        images: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 15,
        sku: 'CHN-001',
          brandId: null,
        volume: '100ml',
        categoryId: categories[1].id // Qadın Parfümləri
      }
    }),
    prisma.product.upsert({
      where: { sku: 'DIR-002' },
      update: {},
      create: {
        name: 'Dior Sauvage Eau de Toilette',
        description: 'Dior Sauvage is a fresh and powerful fragrance that captures the spirit of wide-open spaces.',
        price: 189.99,
        images: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 25,
        sku: 'DIR-002',
          brandId: null,
        volume: '100ml',
        categoryId: categories[0].id // Kişi Parfümləri
      }
    }),
    prisma.product.upsert({
      where: { sku: 'YSL-003' },
      update: {},
      create: {
        name: 'Yves Saint Laurent Black Opium',
        description: 'Black Opium is an addictive gourmand fragrance with notes of coffee, vanilla, and white flowers.',
        price: 159.99,
        salePrice: 129.99,
        images: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 20,
        sku: 'YSL-003',
        brandId: null,
        volume: '90ml',
        categoryId: categories[1].id // Qadın Parfümləri
      }
    }),
    prisma.product.upsert({
      where: { sku: 'TF-004' },
      update: {},
      create: {
        name: 'Tom Ford Tobacco Vanille',
        description: 'A modern take on an old-world men\'s club. A smooth oriental, vanilla-based fragrance.',
        price: 399.99,
        images: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 8,
        sku: 'TF-004',
          brandId: null,
        volume: '100ml',
        categoryId: categories[2].id // Unisex Parfümlər
      }
    }),
    prisma.product.upsert({
      where: { sku: 'JML-005' },
      update: {},
      create: {
        name: 'Jo Malone London Wood Sage & Sea Salt',
        description: 'Escape the everyday along the windswept shore. Waves breaking white, the air fresh with sea salt and spray.',
        price: 129.99,
        images: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 30,
        sku: 'JML-005',
        brandId: null,
        volume: '100ml',
        categoryId: categories[2].id // Unisex Parfümlər
      }
    }),
    prisma.product.upsert({
      where: { sku: 'VER-006' },
      update: {},
      create: {
        name: 'Versace Eros Eau de Toilette',
        description: 'A fresh, sensual fragrance with a luminous, intense structure that gives way to a Mediterranean character.',
        price: 89.99,
        salePrice: 69.99,
        images: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=600&h=600&fit=crop',
        inStock: true,
        stockCount: 18,
        sku: 'VER-006',
          brandId: null,
        volume: '100ml',
        categoryId: categories[0].id // Kişi Parfümləri
      }
    })
  ])

  console.log('✅ Products created')

  // Create sliders
  const sliders = await Promise.all([
    prisma.slider.upsert({
      where: { id: 'slider-1' },
      update: {},
      create: {
        id: 'slider-1',
        title: 'Yeni Koleksiya',
        subtitle: '2024-cü ilin ən yaxşı parfümləri',
        description: 'Dünyanın ən məşhur brendlərinin yeni parfümlərini kəşf edin',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=1200&h=600&fit=crop',
        link: '/products',
        buttonText: 'İndi Alış-Veriş Et',
        isActive: true,
        order: 1
      }
    }),
    prisma.slider.upsert({
      where: { id: 'slider-2' },
      update: {},
      create: {
        id: 'slider-2',
        title: 'Endirimlər',
        subtitle: '50%-ə qədər endirim',
        description: 'Sevimli parfümlərinizi daha sərfəli qiymətə əldə edin',
        image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=1200&h=600&fit=crop',
        link: '/products?sale=true',
        buttonText: 'Endirimləri Gör',
        isActive: true,
        order: 2
      }
    }),
    prisma.slider.upsert({
      where: { id: 'slider-3' },
      update: {},
      create: {
        id: 'slider-3',
        title: 'Chanel Koleksiyası',
        subtitle: 'Klassik zəriflik',
        description: 'Chanel-in ən məşhur parfümlərini kəşf edin',
        image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&h=600&fit=crop',
        link: '/products?search=chanel',
        buttonText: 'Chanel Parfümləri',
        isActive: true,
        order: 3
      }
    })
  ])

  console.log('✅ Sliders created')

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@sahibparfumeriya.az' },
      update: {},
      create: {
        email: 'admin@sahibparfumeriya.az',
        name: 'Admin',
        password: 'admin123', // In real app, this should be hashed
        role: 'ADMIN'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Test User',
        password: 'user123', // In real app, this should be hashed
        role: 'USER'
      }
    })
  ])

  console.log('✅ Users created')

  // Create sample reviews
  const reviews = await Promise.all([
    prisma.review.upsert({
      where: { 
        userId_productId: {
          userId: users[1].id,
          productId: products[0].id
        }
      },
      update: {},
      create: {
        rating: 5,
        comment: 'Mükəmməl parfüm! Çox uzun müddət davam edir.',
        userId: users[1].id,
        productId: products[0].id
      }
    }),
    prisma.review.upsert({
      where: { 
        userId_productId: {
          userId: users[1].id,
          productId: products[1].id
        }
      },
      update: {},
      create: {
        rating: 4,
        comment: 'Gözəl qoxu, amma qiyməti bir az yüksəkdir.',
        userId: users[1].id,
        productId: products[1].id
      }
    })
  ])

  console.log('✅ Reviews created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
