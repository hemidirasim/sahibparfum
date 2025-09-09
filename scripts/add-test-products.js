const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addTestProducts() {
  try {
    console.log('🔄 Test məhsulları əlavə edilir...')

    // Test məhsulları
    const testProducts = [
      {
        name: 'Chanel N°5 Eau de Parfum',
        description: 'Klassik qadın parfümü - floral və aldehid notları ilə',
        brand: 'Chanel',
        categoryName: 'Kadın Parfümü',
        price: 299.99,
        salePrice: 249.99,
        stockCount: 15,
        sku: 'CHN001',
        isNew: true,
        isOnSale: true,
        isActive: true,
        variants: [
          { volume: '50ml', price: 299.99, salePrice: 249.99, stock: 8, sku: 'CHN001-50' },
          { volume: '100ml', price: 499.99, salePrice: 399.99, stock: 5, sku: 'CHN001-100' },
          { volume: '200ml', price: 899.99, salePrice: 749.99, stock: 2, sku: 'CHN001-200' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Floral, Aldehyde' },
          { name: 'Durability', value: '6-8 hours' },
          { name: 'Season', value: 'All seasons' },
          { name: 'Gender', value: 'Women' }
        ]
      },
      {
        name: 'Dior Sauvage Eau de Toilette',
        description: 'Modern kişi parfümü - təravətli və odunsu notları ilə',
        brand: 'Dior',
        categoryName: 'Kişi Parfümü',
        price: 189.99,
        salePrice: null,
        stockCount: 12,
        sku: 'DIR001',
        isNew: false,
        isOnSale: false,
        isActive: true,
        variants: [
          { volume: '60ml', price: 189.99, salePrice: null, stock: 7, sku: 'DIR001-60' },
          { volume: '100ml', price: 289.99, salePrice: null, stock: 5, sku: 'DIR001-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Fresh, Woody' },
          { name: 'Durability', value: '8-10 hours' },
          { name: 'Season', value: 'Spring/Summer' },
          { name: 'Gender', value: 'Men' }
        ]
      },
      {
        name: 'Yves Saint Laurent Black Opium',
        description: 'Misterioz qadın parfümü - oriental və vanil notları ilə',
        brand: 'Yves Saint Laurent',
        categoryName: 'Kadın Parfümü',
        price: 159.99,
        salePrice: 129.99,
        stockCount: 8,
        sku: 'YSL001',
        isNew: true,
        isOnSale: true,
        isActive: true,
        variants: [
          { volume: '30ml', price: 159.99, salePrice: 129.99, stock: 3, sku: 'YSL001-30' },
          { volume: '50ml', price: 249.99, salePrice: 199.99, stock: 3, sku: 'YSL001-50' },
          { volume: '90ml', price: 399.99, salePrice: 319.99, stock: 2, sku: 'YSL001-90' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Oriental, Vanilla' },
          { name: 'Durability', value: '10-12 hours' },
          { name: 'Season', value: 'Fall/Winter' },
          { name: 'Gender', value: 'Women' }
        ]
      },
      {
        name: 'Tom Ford Tobacco Vanille',
        description: 'Lüks unisex parfümü - tütün və vanil notları ilə',
        brand: 'Tom Ford',
        categoryName: 'Unisex Parfümü',
        price: 399.99,
        salePrice: null,
        stockCount: 6,
        sku: 'TF001',
        isNew: false,
        isOnSale: false,
        isActive: true,
        variants: [
          { volume: '50ml', price: 399.99, salePrice: null, stock: 4, sku: 'TF001-50' },
          { volume: '100ml', price: 699.99, salePrice: null, stock: 2, sku: 'TF001-100' }
        ],
        attributes: [
          { name: 'Aroma', value: 'Tobacco, Vanilla, Spices' },
          { name: 'Durability', value: '12+ hours' },
          { name: 'Season', value: 'Fall/Winter' },
          { name: 'Gender', value: 'Unisex' }
        ]
      }
    ]

    for (const productData of testProducts) {
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

    console.log('✅ Test məhsulları uğurla əlavə edildi!')
    
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

addTestProducts()
