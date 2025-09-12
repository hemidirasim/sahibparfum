const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sliders = [
  {
    title: 'Yeni Kolleksiya',
    subtitle: 'Ən son parfüm modelləri',
    description: '2024-cü ilin ən gözəl parfüm kolleksiyası ilə tanış olun',
    image: '/images/sliders/new-collection.jpg',
    link: '/products',
    buttonText: 'Kolleksiyaya bax',
    isActive: true,
    order: 1
  },
  {
    title: 'Lüks Parfümlər',
    subtitle: 'Premium markalar',
    description: 'Dünyanın ən məşhur lüks parfüm markalarından seçim',
    image: '/images/sliders/luxury-perfumes.jpg',
    link: '/products?category=luks',
    buttonText: 'Alış-veriş et',
    isActive: true,
    order: 2
  },
  {
    title: 'Xüsusi Endirimlər',
    subtitle: '50% endirim',
    description: 'Seçilmiş parfümlərdə böyük endirimlər',
    image: '/images/sliders/special-offers.jpg',
    link: '/products?sale=true',
    buttonText: 'Endirimləri gör',
    isActive: true,
    order: 3
  }
];

async function addSliders() {
  try {
    console.log('Slider-lar əlavə edilir...');
    
    for (const sliderData of sliders) {
      const existingSlider = await prisma.slider.findFirst({
        where: { title: sliderData.title }
      });
      
      if (!existingSlider) {
        await prisma.slider.create({
          data: sliderData
        });
        console.log(`✅ ${sliderData.title} əlavə edildi`);
      } else {
        console.log(`⚠️ ${sliderData.title} artıq mövcuddur`);
      }
    }
    
    console.log('🎉 Bütün slider-lar uğurla əlavə edildi!');
    
    // Slider sayını göstər
    const sliderCount = await prisma.slider.count();
    console.log(`📊 Cəmi slider sayı: ${sliderCount}`);
    
  } catch (error) {
    console.error('❌ Xəta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSliders();
