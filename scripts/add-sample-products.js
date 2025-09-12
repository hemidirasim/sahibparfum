const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: 'Chanel N°5',
    description: 'Klassik və zərif ətir',
    price: 299.99,
    salePrice: 249.99,
    images: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    inStock: true,
    stockCount: 50,
    sku: 'CHN-001',
    volume: '100ml',
    isNew: false,
    isOnSale: true,
    isActive: true,
    category: {
      connect: { name: 'Qadın Parfümü' }
    },
    brand: {
      connect: { name: 'Chanel' }
    }
  },
  {
    name: 'Dior Sauvage',
    description: 'Kişi üçün güclü və cazibədar ətir',
    price: 189.99,
    images: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=400&h=400&fit=crop',
    inStock: true,
    stockCount: 30,
    sku: 'DIO-002',
    volume: '100ml',
    isNew: true,
    isOnSale: false,
    isActive: true,
    category: {
      connect: { name: 'Kişi Parfümü' }
    },
    brand: {
      connect: { name: 'Dior' }
    }
  },
  {
    name: 'Yves Saint Laurent Black Opium',
    description: 'Qadın üçün sirli və cazibədar ətir',
    price: 159.99,
    salePrice: 129.99,
    images: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop',
    inStock: true,
    stockCount: 25,
    sku: 'YSL-003',
    volume: '90ml',
    isNew: false,
    isOnSale: true,
    isActive: true,
    category: {
      connect: { name: 'Qadın Parfümü' }
    },
    brand: {
      connect: { name: 'YSL' }
    }
  },
  {
    name: 'Tom Ford Black Orchid',
    description: 'Lüks və ekzotik ətir',
    price: 399.99,
    images: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=400&fit=crop',
    inStock: true,
    stockCount: 15,
    sku: 'TF-004',
    volume: '100ml',
    isNew: true,
    isOnSale: false,
    isActive: true,
    category: {
      connect: { name: 'Qadın Parfümü' }
    },
    brand: {
      connect: { name: 'Tom Ford' }
    }
  },
  {
    name: 'Versace Eros',
    description: 'Kişi üçün güclü və ehtiraslı ətir',
    price: 179.99,
    images: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop',
    inStock: true,
    stockCount: 40,
    sku: 'VER-005',
    volume: '100ml',
    isNew: false,
    isOnSale: false,
    isActive: true,
    category: {
      connect: { name: 'Kişi Parfümü' }
    },
    brand: {
      connect: { name: 'Versace' }
    }
  }
]

async function addSampleProducts() {
  try {
    console.log('🔄 Məhsullar əlavə edilir...')

    for (const productData of sampleProducts) {
      try {
        const product = await prisma.product.create({
          data: productData
        })
        console.log(`✅ ${product.name} əlavə edildi`)
      } catch (error) {
        console.error(`❌ ${productData.name} əlavə edilərkən xəta:`, error.message)
      }
    }

    console.log('🎉 Məhsullar əlavə edildi!')
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleProducts()
