import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'rasim@admin.az' },
    update: {},
    create: {
      name: 'Admin',
      email: 'rasim@admin.az',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  })

  console.log('✅ Admin user created')

  // Create sliders
  const sliders = await Promise.all([
    prisma.slider.upsert({
      where: { id: 'slider-1' },
      update: {},
      create: {
        id: 'slider-1',
        title: 'Yeni Koleksiya',
        subtitle: '2025-ci ilin ən yaxşı parfümləri',
        description: 'Yeni gələn parfüm kolleksiyasını kəşf edin',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=1200&h=600&fit=crop',
        link: '/products?new=true',
        buttonText: 'Kəşf Et',
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
        subtitle: '50% endirim',
        description: 'Seçilmiş parfümlərdə böyük endirimlər',
        image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=1200&h=600&fit=crop',
        link: '/products?sale=true',
        buttonText: 'Alış-veriş Et',
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
        subtitle: 'Klassik lüks',
        description: 'Chanel-in ən məşhur parfümləri',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&h=600&fit=crop',
        link: '/products?brand=chanel',
        buttonText: 'Bax',
        isActive: true,
        order: 3
      }
    })
  ])

  console.log('✅ Sliders created')

  // Create sample blog posts
  const blogs = await Promise.all([
    prisma.blog.upsert({
      where: { slug: 'parfum-secimi-ucun-tovsiyeler' },
      update: {},
      create: {
        title: 'Parfüm Seçimi Üçün Tövsiyələr',
        slug: 'parfum-secimi-ucun-tovsiyeler',
        excerpt: 'Düzgün parfüm seçmək üçün əsas məsləhətlər və tövsiyələr',
        content: `Parfüm seçmək həm maraqlı, həm də çətin bir prosesdir. Düzgün parfüm seçmək üçün aşağıdakı məsləhətləri nəzərə alın:

1. **Dərinizi Tanıyın**: Hər insanın dərisi fərqlidir və parfümlər fərqli şəkildə reaksiya verir.

2. **Mövsümü Nəzərə Alın**: Yay aylarında daha yüngül, qış aylarında isə daha ağır parfümlər seçin.

3. **Test Edin**: Parfüm alış-verişi etməzdən əvvəl onu dərinizdə test edin və ən azı 30 dəqiqə gözləyin.

4. **Notları Öyrənin**: Parfümün əsas notlarını öyrənərək, sevdiyiniz qoxuları müəyyən edin.

5. **Qiymətə Diqqət Edin**: Həmişə ən bahalı parfüm ən yaxşı deyil. Sizin üçün uyğun olanı tapın.`,
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d1a6f6a9?w=800&h=400&fit=crop',
        isPublished: true,
        publishedAt: new Date()
      }
    }),
    prisma.blog.upsert({
      where: { slug: 'parfum-notlari-ve-aromalar' },
      update: {},
      create: {
        title: 'Parfüm Notları və Aromalar',
        slug: 'parfum-notlari-ve-aromalar',
        excerpt: 'Parfümlərdə istifadə olunan əsas notlar və aromalar haqqında məlumat',
        content: `Parfümlər üç əsas not qrupundan ibarətdir:

**Üst Notlar (Top Notes)**
- İlk 15-30 dəqiqədə hiss olunan qoxular
- Çox vaxt sitrus, çiçək və ya yüngül meyvə notları
- Nümunələr: limon, portaqal, lavanda

**Orta Notlar (Middle Notes)**
- Parfümün əsas xarakterini müəyyən edən notlar
- 30 dəqiqədən 2 saata qədər davam edir
- Nümunələr: gül, yasəmən, vanil

**Baza Notlar (Base Notes)**
- Parfümün əsasını təşkil edən, ən uzun davam edən notlar
- 2 saatdan çox davam edir
- Nümunələr: ağac, müşk, amber

Bu notların uyğun birləşməsi parfümün unikal xarakterini yaradır.`,
        image: 'https://images.unsplash.com/photo-1592945403244-b3faa74b2c9a?w=800&h=400&fit=crop',
        isPublished: true,
        publishedAt: new Date()
      }
    }),
    prisma.blog.upsert({
      where: { slug: 'parfum-saxlama-ve-qoruma' },
      update: {},
      create: {
        title: 'Parfüm Saxlama və Qoruma',
        slug: 'parfum-saxlama-ve-qoruma',
        excerpt: 'Parfümlərinizi düzgün saxlamaq və uzun müddət qorumaq üçün tövsiyələr',
        content: `Parfümlərinizi düzgün saxlamaq onların keyfiyyətini və davamlılığını artırır:

**Saxlama Yerləri**
- Sərin və quru yerlərdə saxlayın
- Birbaşa günəş işığından uzaq tutun
- Hərarət dəyişikliklərindən qoruyun

**Qoruma Tədbirləri**
- Qapağı sıx bağlayın
- Sprey başlığını təmiz saxlayın
- Uzun müddət istifadə etmədikdə ara-sıra çalışdırın

**Müddət**
- Açılmamış parfümlər 3-5 il saxlanır
- Açılmış parfümlər 2-3 il istifadə edilə bilər
- Qoxu dəyişibsə istifadə etməyin

**Səhvlər**
- Banyoda saxlamayın
- Maşında qoymayın
- Dondurucuda saxlamağa ehtiyac yoxdur`,
        image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&h=400&fit=crop',
        isPublished: true,
        publishedAt: new Date()
      }
    })
  ])

  console.log('✅ Blog posts created')

  // Create support content
  const supportContent = await Promise.all([
    prisma.supportContent.create({
      data: {
        page: 'orders',
        title: 'Sifarişlərin İdarə Edilməsi',
        content: `Sifarişlərinizi asanlıqla idarə edə bilərsiniz:

**Sifariş Statusları**
- Gözləyir: Sifarişiniz qəbul edilib
- Hazırlanır: Sifarişiniz hazırlanır
- Göndərilib: Sifarişiniz kuryerə təhvil verilib
- Çatdırılıb: Sifarişiniz çatdırılıb

**Sifarişi Ləğv Etmək**
- Sifariş statusu "Gözləyir" olduqda ləğv edə bilərsiniz
- Ləğv etmək üçün bizimlə əlaqə saxlayın

**Sifarişi Dəyişdirmək**
- Sifariş statusu "Gözləyir" olduqda dəyişdirə bilərsiniz
- Dəyişiklik üçün bizimlə əlaqə saxlayın`,
        order: 1
      }
    }),
    prisma.supportContent.create({
      data: {
        page: 'payment',
        title: 'Ödəniş Üsulları',
        content: `Müxtəlif ödəniş üsulları təklif edirik:

**Nağd Ödəniş**
- Çatdırılma zamanı nağd ödəniş
- Ən güvənli ödəniş üsulu

**Kart ilə Ödəniş**
- Visa, Mastercard qəbul edilir
- Təhlükəsiz ödəniş sistemi

**Taksit Ödənişi**
- 2, 3, 6, 12 aylıq taksit imkanları
- Birbank kartları üçün

**Ödəniş Təhlükəsizliyi**
- Bütün ödənişlər şifrələnir
- Kart məlumatları saxlanmır`,
        order: 2
      }
    }),
    prisma.supportContent.create({
      data: {
        page: 'delivery',
        title: 'Çatdırılma Xidməti',
        content: `Çatdırılma xidmətimiz haqqında məlumat:

**Çatdırılma Sahələri**
- Bakı şəhəri daxilində
- Gəncə şəhəri daxilində
- Sumqayıt şəhəri daxilində

**Çatdırılma Müddəti**
- Bakı: 1-2 iş günü
- Gəncə: 2-3 iş günü
- Sumqayıt: 2-3 iş günü

**Çatdırılma Haqqı**
- 100₼ üzərində pulsuz çatdırılma
- 100₼ altında 10₼ çatdırılma haqqı

**Çatdırılma Vaxtı**
- Bazar ertəsi - Şənbə: 09:00-18:00
- Bazar günü çatdırılma yoxdur`,
        order: 3
      }
    }),
    prisma.supportContent.create({
      data: {
        page: 'returns',
        title: 'Qaytarma və Dəyişdirmə',
        content: `Qaytarma və dəyişdirmə siyasətimiz:

**Qaytarma Müddəti**
- 14 gün ərzində qaytara bilərsiniz
- Məhsul istifadə edilməmiş olmalıdır

**Qaytarma Səbəbləri**
- Məhsul zədələnmişdir
- Yanlış məhsul göndərilib
- Məhsul təsvirə uyğun deyil

**Qaytarma Prosesi**
1. Bizimlə əlaqə saxlayın
2. Qaytarma səbəbini bildirin
3. Məhsulu qaytarın
4. Geri ödəniş alın

**Dəyişdirmə**
- Eyni qiymətli məhsulla dəyişdirilə bilər
- Fərq varsa əlavə ödəniş tələb olunur`,
        order: 4
      }
    }),
    prisma.supportContent.create({
      data: {
        page: 'faq',
        title: 'Tez-tez Verilən Suallar',
        content: `Ən çox verilən suallar və cavabları:

**Sifariş haqqında**
- S: Sifarişi necə verə bilərəm?
- C: Məhsulu səbətə əlavə edin və checkout səhifəsindən sifariş verin.

**Ödəniş haqqında**
- S: Hansı ödəniş üsulları qəbul edilir?
- C: Nağd, kart və taksit ödənişi qəbul edilir.

**Çatdırılma haqqında**
- S: Çatdırılma nə qədər vaxt alır?
- C: Bakıda 1-2, digər şəhərlərdə 2-3 iş günü.

**Qaytarma haqqında**
- S: Məhsulu qaytara bilərəmmi?
- C: Bəli, 14 gün ərzində qaytara bilərsiniz.`,
        order: 5
      }
    }),
    prisma.supportContent.create({
      data: {
        page: 'loyalty',
        title: 'Sədaqət Proqramı',
        content: `Sədaqət proqramımız haqqında məlumat:

**Sədaqət Xalları**
- Hər 1₼ üçün 1 xal qazanırsınız
- 100 xal = 10₼ endirim

**Xal İstifadəsi**
- Alış-veriş zamanı xallarınızı istifadə edin
- Minimum 50 xal istifadə edilə bilər

**Xüsusi Təkliflər**
- Sədaqət üzvləri üçün xüsusi endirimlər
- Erken bildiriş yeni məhsullar haqqında
- Eksklüziv təkliflər

**Üzvlük Səviyyələri**
- Gümüş: 1000₼ alış-veriş
- Qızıl: 5000₼ alış-veriş
- Platin: 10000₼ alış-veriş`,
        order: 6
      }
    })
  ])

  console.log('✅ Support content created')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })