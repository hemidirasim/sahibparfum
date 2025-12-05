import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultContent = {
  orders: [
    {
      title: 'Sifarişi necə verə bilərəm?',
      content: 'Sifariş vermək üçün məhsul səhifəsində istədiyiniz məhsulu seçin və "Səbətə əlavə et" düyməsini klikləyin. Səbətinizə keçid edin və "Sifarişi tamamla" düyməsini klikləyin. Sonra çatdırılma ünvanınızı və ödəniş metodunu seçin.',
      order: 1
    },
    {
      title: 'Sifarişimi necə izləyə bilərəm?',
      content: 'Qeydiyyatdan keçdikdən sonra "Hesabım" bölməsinə daxil olun və "Sifarişlərim" bölməsindən bütün sifarişlərinizi görə bilərsiniz. Hər bir sifarişin statusunu və detallarını orada izləyə bilərsiniz.',
      order: 2
    },
    {
      title: 'Sifarişi ləğv edə bilərəmmi?',
      content: 'Bəli, sifarişiniz hələ göndərilməyibsə, onu ləğv edə bilərsiniz. "Sifarişlərim" bölməsində sifarişinizin yanında "Ləğv et" düyməsini görəcəksiniz. Sifariş göndərildikdən sonra ləğv etmək mümkün deyil, lakin geri qaytarma prosesindən istifadə edə bilərsiniz.',
      order: 3
    },
    {
      title: 'Sifariş nə qədər müddətdə hazırlanır?',
      content: 'Sifarişləriniz adətən 1-2 iş günü ərzində hazırlanır və göndərilir. Bayram günləri və ya xüsusi tədbirlər zamanı bu müddət bir qədər uzana bilər. Sifarişinizin statusunu "Sifarişlərim" bölməsindən izləyə bilərsiniz.',
      order: 4
    }
  ],
  payment: [
    {
      title: 'Hansı ödəniş metodları mövcuddur?',
      content: 'Biz kartla ödəniş (Visa, Mastercard), nağd ödəniş (çatdırılma zamanı) və hissəli ödəniş metodlarını təklif edirik. Ödəniş metodunu sifariş verərkən seçə bilərsiniz.',
      order: 1
    },
    {
      title: 'Kartla ödəniş təhlükəsizdir?',
      content: 'Bəli, bütün ödənişlər SSL şifrələmə ilə qorunur və təhlükəsizdir. Kart məlumatlarınız bizim sistemimizdə saxlanılmır. Bütün ödənişlər təhlükəsiz ödəniş şlüzləri vasitəsilə həyata keçirilir.',
      order: 2
    },
    {
      title: 'Hissəli ödəniş necə işləyir?',
      content: 'Hissəli ödəniş üçün sifariş verərkən "Hissəli ödəniş" seçimini edin və lazımi sənədləri təqdim edin. Müraciətiniz təsdiqləndikdən sonra sifarişiniz hazırlanacaq. Hissəli ödəniş şərtləri haqqında ətraflı məlumat üçün bizimlə əlaqə saxlayın.',
      order: 3
    },
    {
      title: 'Ödənişdən sonra pul geri qaytarıla bilərmi?',
      content: 'Bəli, məhsul geri qaytarıldıqda və təsdiqləndikdən sonra ödənişiniz geri qaytarılacaq. Geri qaytarma prosesi 5-7 iş günü çəkə bilər. Daha ətraflı məlumat üçün "Geri Qaytarma" bölməsinə baxın.',
      order: 4
    }
  ],
  delivery: [
    {
      title: 'Çatdırılma xərci nə qədərdir?',
      content: '100₼ və daha yüksək sifarişlər üçün çatdırılma pulsuzdur. 100₼-dən aşağı sifarişlər üçün çatdırılma xərci 10₼-dir. Çatdırılma xərci sifariş verərkən avtomatik hesablanır.',
      order: 1
    },
    {
      title: 'Çatdırılma müddəti nə qədərdir?',
      content: 'Bakı şəhəri daxilində çatdırılma 1-2 iş günü ərzində həyata keçirilir. Regionlara çatdırılma 3-5 iş günü çəkə bilər. Çatdırılma müddəti sifarişin statusuna görə dəyişə bilər.',
      order: 2
    },
    {
      title: 'Çatdırılma zamanı məhsulu yoxlaya bilərəmmi?',
      content: 'Bəli, çatdırılma zamanı məhsulu yoxlaya bilərsiniz. Məhsulun qablaşdırmasını və vəziyyətini yoxlayın. Əgər hər hansı problem görsəniz, çatdırılma zamanı rədd edə bilərsiniz.',
      order: 3
    },
    {
      title: 'Hansı regionlara çatdırılma edilir?',
      content: 'Biz bütün Azərbaycan ərazisinə çatdırılma xidməti təklif edirik. Bakı şəhəri daxilində çatdırılma 1-2 iş günü, regionlara isə 3-5 iş günü çəkə bilər.',
      order: 4
    }
  ],
  returns: [
    {
      title: 'Məhsulu necə geri qaytara bilərəm?',
      content: 'Məhsulu geri qaytarmaq üçün "Hesabım" > "Sifarişlərim" bölməsinə daxil olun və geri qaytarmaq istədiyiniz sifarişin yanında "Geri qaytar" düyməsini klikləyin. Geri qaytarma formunu doldurun və məhsulu bizə göndərin.',
      order: 1
    },
    {
      title: 'Geri qaytarma müddəti nə qədərdir?',
      content: 'Məhsulu aldığınız tarixdən 14 gün ərzində geri qaytara bilərsiniz. Məhsul istifadə edilməmiş, orijinal qablaşdırmasında və etiketləri ilə olmalıdır.',
      order: 2
    },
    {
      title: 'Geri qaytarma xərci kimə aiddir?',
      content: 'Əgər məhsulda qüsur varsa və ya səhv məhsul göndərilibsə, geri qaytarma xərci bizim üzərimizədir. Digər hallarda geri qaytarma xərci müştəriyə aiddir.',
      order: 3
    },
    {
      title: 'Pul geri qaytarılması nə qədər müddət çəkir?',
      content: 'Geri qaytarma prosesi təsdiqləndikdən sonra ödənişiniz 5-7 iş günü ərzində geri qaytarılacaq. Geri qaytarma eyni ödəniş metoduna görə həyata keçirilir.',
      order: 4
    }
  ],
  loyalty: [
    {
      title: 'Loyallıq proqramı nədir?',
      content: 'Loyallıq proqramımız sizə hər alış-verişdən sonra xallar qazandırır. Topladığınız xallar ilə gələcək alış-verişlərinizdə endirim əldə edə bilərsiniz. 100₼ alış-veriş üçün 10 xal qazanırsınız.',
      order: 1
    },
    {
      title: 'Xalları necə toplaya bilərəm?',
      content: 'Hər alış-verişdən sonra xallar avtomatik olaraq hesabınıza əlavə olunur. Xallarınızı "Hesabım" > "Loyallıq Xallarım" bölməsindən görə bilərsiniz.',
      order: 2
    },
    {
      title: 'Xalları necə istifadə edə bilərəm?',
      content: 'Topladığınız xalları gələcək alış-verişlərinizdə endirim kimi istifadə edə bilərsiniz. 100 xal = 10₼ endirim. Xalları istifadə etmək üçün ödəniş səhifəsində "Xalları istifadə et" seçimini edin.',
      order: 3
    },
    {
      title: 'Xalların müddəti bitirmir?',
      content: 'Xalların müddəti 1 ildir. 1 il ərzində istifadə edilməyən xallar ləğv olunur. Xallarınızın müddətini "Hesabım" > "Loyallıq Xallarım" bölməsindən yoxlaya bilərsiniz.',
      order: 4
    }
  ],
  faq: [
    {
      title: 'Məhsullar orijinaldırmı?',
      content: 'Bəli, bütün məhsullarımız 100% orijinaldır və rəsmi distribütorlardan gəlir. Hər bir məhsul zəmanət ilə təqdim olunur.',
      order: 1
    },
    {
      title: 'Məhsulun keyfiyyətini necə yoxlaya bilərəm?',
      content: 'Məhsullarımızın hamısı orijinal qablaşdırmada və zəmanət ilə təqdim olunur. Əgər hər hansı şübhəniz varsa, məhsulu çatdırılma zamanı yoxlaya bilərsiniz və ya bizimlə əlaqə saxlayın.',
      order: 2
    },
    {
      title: 'Məhsulun son istifadə tarixi varmı?',
      content: 'Parfümlərin son istifadə tarixi yoxdur, lakin məhsullarımızın hamısı yeni və təzədir. Məhsullarımız düzgün şəraitdə saxlanılır və keyfiyyətli vəziyyətdə təqdim olunur.',
      order: 3
    },
    {
      title: 'Hesabımı necə silə bilərəm?',
      content: 'Hesabınızı silmək üçün bizimlə əlaqə saxlayın. E-poçt ünvanımız: info@sahibparfumeriya.az və ya telefon: +994 50 123 45 67',
      order: 4
    },
    {
      title: 'Şifrəmi unutdum, necə bərpa edə bilərəm?',
      content: 'Giriş səhifəsində "Şifrəni unutdum" linkinə klikləyin və e-poçt ünvanınızı daxil edin. Şifrə bərpa linki e-poçt ünvanınıza göndəriləcək.',
      order: 5
    }
  ]
}

async function resetSupportContent() {
  try {
    console.log('Bütün kontentlər silinir...')
    
    // Delete all existing support content
    await prisma.supportContent.deleteMany({})
    console.log('Bütün kontentlər silindi.')
    
    console.log('Yeni kontentlər yaradılır...')
    
    // Create new content for each page
    for (const [page, contents] of Object.entries(defaultContent)) {
      for (const content of contents) {
        await prisma.supportContent.create({
          data: {
            title: content.title,
            content: content.content,
            page: page,
            order: content.order
          }
        })
      }
      console.log(`${page} səhifəsi üçün ${contents.length} kontent yaradıldı.`)
    }
    
    console.log('Bütün kontentlər uğurla yaradıldı!')
  } catch (error) {
    console.error('Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetSupportContent()

