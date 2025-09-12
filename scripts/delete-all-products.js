const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllProducts() {
  try {
    console.log('Bütün məhsullar silinir...');
    
    // Əvvəlcə rating-ləri sil
    const deletedRatings = await prisma.productRating.deleteMany({});
    console.log(`✅ ${deletedRatings.count} rating silindi`);
    
    // Sonra order item-ləri sil
    const deletedOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`✅ ${deletedOrderItems.count} order item silindi`);
    
    // Sonra məhsulları sil
    const deletedProducts = await prisma.product.deleteMany({});
    console.log(`✅ ${deletedProducts.count} məhsul silindi`);
    
    console.log('🎉 Bütün məhsullar uğurla silindi!');
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllProducts();
