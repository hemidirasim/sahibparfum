const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDashboard() {
  try {
    console.log('🔄 Dashboard test məlumatları əlavə edilir...')

    // Test kateqoriyaları
    const categories = [
      { name: 'Kadın Parfümü', description: 'Kadınlar üçün ətirlər' },
      { name: 'Kişi Parfümü', description: 'Kişilər üçün ətirlər' },
      { name: 'Unisex Parfümü', description: 'Hər iki cins üçün ətirlər' }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      })
    }

    // Test məhsulları
    const products = [
      {
        name: 'Chanel N°5',
        description: 'Klassik qadın parfümü',
        price: 299.99,
        salePrice: 249.99,
        sku: 'CHN001',
        brand: 'Chanel',
        isNew: true,
        isOnSale: true,
        isActive: true,
        stockCount: 15,
        categoryName: 'Kadın Parfümü'
      },
      {
        name: 'Dior Sauvage',
        description: 'Modern kişi parfümü',
        price: 189.99,
        salePrice: null,
        sku: 'DIR001',
        brand: 'Dior',
        isNew: false,
        isOnSale: false,
        isActive: true,
        stockCount: 8,
        categoryName: 'Kişi Parfümü'
      },
      {
        name: 'Tom Ford Tobacco Vanille',
        description: 'Lüks unisex parfümü',
        price: 399.99,
        salePrice: null,
        sku: 'TF001',
        brand: 'Tom Ford',
        isNew: true,
        isOnSale: false,
        isActive: true,
        stockCount: 12,
        categoryName: 'Unisex Parfümü'
      }
    ]

    for (const product of products) {
      const category = await prisma.category.findUnique({
        where: { name: product.categoryName }
      })

      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: {
          name: product.name,
          description: product.description,
          price: product.price,
          salePrice: product.salePrice,
          sku: product.sku,
          brand: product.brand,
          isNew: product.isNew,
          isOnSale: product.isOnSale,
          isActive: product.isActive,
          stockCount: product.stockCount,
          images: [],
          categoryId: category.id
        }
      })
    }

    // Test istifadəçiləri
    const users = [
      { name: 'Əli Məmmədov', email: 'ali@example.com', role: 'USER' },
      { name: 'Aysu Əliyeva', email: 'aysu@example.com', role: 'USER' },
      { name: 'Rəşad Hüseynov', email: 'rashad@example.com', role: 'USER' },
      { name: 'Leyla Əhmədova', email: 'leyla@example.com', role: 'USER' },
      { name: 'Orxan Əliyev', email: 'orxan@example.com', role: 'USER' }
    ]

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          name: user.name,
          email: user.email,
          role: user.role,
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJmHhK.' // password: 123456
        }
      })
    }

    // Test sifarişləri
    const orders = [
      {
        orderNumber: 'ORD-2024-001',
        customerName: 'Əli Məmmədov',
        customerEmail: 'ali@example.com',
        totalAmount: 299.99,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        daysAgo: 2
      },
      {
        orderNumber: 'ORD-2024-002',
        customerName: 'Aysu Əliyeva',
        customerEmail: 'aysu@example.com',
        totalAmount: 189.99,
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        daysAgo: 3
      },
      {
        orderNumber: 'ORD-2024-003',
        customerName: 'Rəşad Hüseynov',
        customerEmail: 'rashad@example.com',
        totalAmount: 159.99,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        daysAgo: 5
      },
      {
        orderNumber: 'ORD-2024-004',
        customerName: 'Leyla Əhmədova',
        customerEmail: 'leyla@example.com',
        totalAmount: 399.99,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        daysAgo: 7
      },
      {
        orderNumber: 'ORD-2024-005',
        customerName: 'Orxan Əliyev',
        customerEmail: 'orxan@example.com',
        totalAmount: 249.99,
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        daysAgo: 10
      }
    ]

    // Delete existing orders first
    await prisma.order.deleteMany({})

    for (const order of orders) {
      const user = await prisma.user.findUnique({
        where: { email: order.customerEmail }
      })

      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() - order.daysAgo)

      await prisma.order.create({
        data: {
          orderNumber: order.orderNumber,
          userId: user?.id,
          guestName: order.customerName,
          guestEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          createdAt: orderDate,
          updatedAt: orderDate
        }
      })
    }

    // Test slider-ləri
    const sliders = [
      {
        title: 'Premium Parfüm Koleksiyası',
        subtitle: 'Dünyanın ən yaxşı markaları',
        description: 'Dünyanın ən yaxşı parfüm markalarını sərfəli qiymətlərlə təqdim edirik.',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&h=600&fit=crop',
        link: '/products',
        buttonText: 'Məhsulları Kəşf Et',
        isActive: true,
        order: 1
      },
      {
        title: 'Yeni Gələn Məhsullar',
        subtitle: 'Ən son parfüm kolleksiyaları',
        description: 'Bu həftə əlavə edilən yeni parfüm kolleksiyalarını kəşf edin.',
        image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=1200&h=600&fit=crop',
        link: '/products?new=true',
        buttonText: 'Yeni Məhsullar',
        isActive: true,
        order: 2
      },
      {
        title: 'Endirim Həftəsi',
        subtitle: '50% -ə qədər endirim',
        description: 'Seçilmiş parfümlərdə böyük endirimlər.',
        image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&h=600&fit=crop',
        link: '/products?sale=true',
        buttonText: 'Endirimləri Gör',
        isActive: false,
        order: 3
      }
    ]

    for (const slider of sliders) {
      await prisma.slider.create({
        data: slider
      })
    }

    console.log('✅ Dashboard test məlumatları uğurla əlavə edildi!')
    console.log('📊 Statistika:')
    console.log('- Məhsullar:', await prisma.product.count())
    console.log('- İstifadəçilər:', await prisma.user.count())
    console.log('- Sifarişlər:', await prisma.order.count())
    console.log('- Slider-lər:', await prisma.slider.count())

  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDashboard()
