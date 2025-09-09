const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addMoreProducts() {
  try {
    console.log('🔄 Əlavə test məhsulları əlavə edilir...')

    // Əlavə test məhsulları
    const moreProducts = [
      {
        name: 'Gucci Bloom Eau de Parfum',
        description: 'Romantik qadın parfümü - çiçək və yasəmən notları ilə',
        brand: 'Gucci',
        categoryName: 'Kadın Parfümü',
        price: 179.99,
        salePrice: 149.99,
        stockCount: 10,
        sku: 'GCC001',
        isNew: true,
        isOnSale: true,
        isActive: true,
        variants: [
          { volume: '30ml', price: 179.99, salePrice: 149.99, stock: 4, sku: 'GCC001-30' },
          { volume: '50ml', price: 249.99, salePrice: 199.99, stock: 4, sku: 'GCC001-50' },
          { volume: '100ml', price: 399.99, salePrice: 329.99, stock: 2, sku: 'GCC001-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Floral, Jasmine' },
          { name: 'Durability', value: '6-8 hours' },
          { name: 'Season', value: 'Spring/Summer' },
          { name: 'Gender', value: 'Women' }
        ]
      },
      {
        name: 'Versace Eros Eau de Toilette',
        description: 'Güclü kişi parfümü - mint və vanil notları ilə',
        brand: 'Versace',
        categoryName: 'Kişi Parfümü',
        price: 89.99,
        salePrice: 69.99,
        stockCount: 18,
        sku: 'VRS001',
        isNew: false,
        isOnSale: true,
        isActive: true,
        variants: [
          { volume: '50ml', price: 89.99, salePrice: 69.99, stock: 8, sku: 'VRS001-50' },
          { volume: '100ml', price: 129.99, salePrice: 99.99, stock: 6, sku: 'VRS001-100' },
          { volume: '200ml', price: 199.99, salePrice: 159.99, stock: 4, sku: 'VRS001-200' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Fresh, Mint, Vanilla' },
          { name: 'Durability', value: '8-10 hours' },
          { name: 'Season', value: 'All seasons' },
          { name: 'Gender', value: 'Men' }
        ]
      },
      {
        name: 'Marc Jacobs Daisy Eau de Toilette',
        description: 'Gənc və təravətli qadın parfümü - çiçək notları ilə',
        brand: 'Marc Jacobs',
        categoryName: 'Kadın Parfümü',
        price: 129.99,
        salePrice: null,
        stockCount: 14,
        sku: 'MJC001',
        isNew: false,
        isOnSale: false,
        isActive: true,
        variants: [
          { volume: '30ml', price: 129.99, salePrice: null, stock: 6, sku: 'MJC001-30' },
          { volume: '50ml', price: 179.99, salePrice: null, stock: 5, sku: 'MJC001-50' },
          { volume: '100ml', price: 249.99, salePrice: null, stock: 3, sku: 'MJC001-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Floral, Fresh' },
          { name: 'Durability', value: '4-6 hours' },
          { name: 'Season', value: 'Spring/Summer' },
          { name: 'Gender', value: 'Women' }
        ]
      },
      {
        name: 'Bleu de Chanel Eau de Parfum',
        description: 'Lüks kişi parfümü - odunsu və sitrus notları ilə',
        brand: 'Chanel',
        categoryName: 'Kişi Parfümü',
        price: 349.99,
        salePrice: null,
        stockCount: 7,
        sku: 'CHN002',
        isNew: false,
        isOnSale: false,
        isActive: true,
        variants: [
          { volume: '50ml', price: 349.99, salePrice: null, stock: 3, sku: 'CHN002-50' },
          { volume: '100ml', price: 499.99, salePrice: null, stock: 4, sku: 'CHN002-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Woody, Citrus' },
          { name: 'Durability', value: '10-12 hours' },
          { name: 'Season', value: 'All seasons' },
          { name: 'Gender', value: 'Men' }
        ]
      },
      {
        name: 'Jo Malone London Wood Sage & Sea Salt',
        description: 'Təbii unisex parfümü - dəniz və adaçayı notları ilə',
        brand: 'Jo Malone London',
        categoryName: 'Unisex Parfümü',
        price: 159.99,
        salePrice: 129.99,
        stockCount: 9,
        sku: 'JML001',
        isNew: true,
        isOnSale: true,
        isActive: true,
        variants: [
          { volume: '30ml', price: 159.99, salePrice: 129.99, stock: 4, sku: 'JML001-30' },
          { volume: '100ml', price: 299.99, salePrice: 249.99, stock: 5, sku: 'JML001-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Fresh, Marine, Sage' },
          { name: 'Durability', value: '4-6 hours' },
          { name: 'Season', value: 'Spring/Summer' },
          { name: 'Gender', value: 'Unisex' }
        ]
      }
    ]

    for (const productData of moreProducts) {
      // Get category
      const category = await prisma.category.findFirst({
        where: { name: productData.categoryName }
      })

      if (!category) {
        console.log(`⚠️ Kateqoriya tapılmadı: ${productData.categoryName}`)
        continue
      }

      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku: productData.sku }
      })

      if (existingProduct) {
        console.log(`⚠️ Məhsul artıq mövcuddur: ${productData.name}`)
        continue
      }

      // Create product
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          categoryId: category.id,
          price: productData.price,
          salePrice: productData.salePrice,
          stockCount: productData.stockCount,
          sku: productData.sku,
          isNew: productData.isNew,
          isOnSale: productData.isOnSale,
          isActive: productData.isActive,
          images: []
        }
      })

      console.log(`✅ Məhsul yaradıldı: ${product.name}`)

      // Create variants
      for (const variantData of productData.variants) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            volume: variantData.volume,
            price: variantData.price,
            salePrice: variantData.salePrice,
            stock: variantData.stock,
            sku: variantData.sku,
            isActive: true
          }
        })
      }

      console.log(`  📦 ${productData.variants.length} variant əlavə edildi`)

      // Create attributes
      for (const attributeData of productData.attributes) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            name: attributeData.name,
            value: attributeData.value
          }
        })
      }

      console.log(`  🏷️ ${productData.attributes.length} xüsusiyyət əlavə edildi`)
    }

    console.log('✅ Əlavə test məhsulları uğurla əlavə edildi!')
    
    // Show summary
    const totalProducts = await prisma.product.count()
    const totalVariants = await prisma.productVariant.count()
    const totalAttributes = await prisma.productAttribute.count()
    
    console.log('📊 Məhsul statistikası:')
    console.log(`- Ümumi məhsullar: ${totalProducts}`)
    console.log(`- Ümumi variantlar: ${totalVariants}`)
    console.log(`- Ümumi xüsusiyyətlər: ${totalAttributes}`)

  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMoreProducts()
