# Sahib Parfumeriya - Premium Parfüm Mağazası

Sahib Parfumeriya, Azərbaycanın ən yaxşı parfüm markalarını sərfəli qiymətlərlə təqdim edən online mağazasıdır.

## Xüsusiyyətlər

- 🛍️ **Online Alış-Veriş**: Rahat və təhlükəsiz online alış-veriş təcrübəsi
- 🎯 **Kateqoriyalar**: Kişi, qadın və unisex parfümlər
- 🔍 **Axtarış və Filtrlər**: Məhsulları marka, qiymət və dəyərləndirməyə görə filtr et
- 🛒 **Səbət Sistemi**: Məhsulları səbətə əlavə et və idarə et
- 👤 **İstifadəçi Hesabı**: Şəxsi hesab və sifariş tarixçəsi
- 💳 **Ödəniş Sistemi**: Stripe ilə təhlükəsiz ödəniş
- 📱 **Responsive Dizayn**: Bütün cihazlarda mükəmməl görünüş

## Texnologiyalar

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe
- **State Management**: Zustand
- **UI Components**: Lucide React Icons

## Quraşdırma

### Tələblər

- Node.js 18+ 
- PostgreSQL
- npm və ya yarn

### Addımlar

1. **Repository-ni klonla**
```bash
git clone <repository-url>
cd parfum-site
```

2. **Asılılıqları quraşdır**
```bash
npm install
```

3. **Environment faylını yarat**
```bash
cp env.example .env.local
```

4. **Environment dəyişənlərini konfiqurasiya et**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sahib_parfumeriya"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

5. **Database-i quraşdır**
```bash
npx prisma generate
npx prisma db push
```

6. **Development server-i başlat**
```bash
npm run dev
```

7. **Brauzerda aç**: [http://localhost:3000](http://localhost:3000)

## Struktur

```
parfum-site/
├── app/                    # Next.js App Router
│   ├── cart/              # Səbət səhifəsi
│   ├── products/          # Məhsullar səhifəsi
│   └── globals.css        # Global stillər
├── components/            # React komponentləri
│   ├── cart/             # Səbət komponentləri
│   ├── products/         # Məhsul komponentləri
│   ├── sections/         # Ana səhifə bölmələri
│   ├── ui/               # UI komponentləri
│   └── providers/        # Context provider-lər
├── hooks/                # Custom React hooks
├── prisma/               # Database sxemi
└── public/               # Statik fayllar
```

## Əsas Səhifələr

- **Ana Səhifə** (`/`): Hero bölmə, kateqoriyalar və populyar məhsullar
- **Məhsullar** (`/products`): Bütün məhsullar və filtrlər
- **Səbət** (`/cart`): Səbət idarəetməsi və ödəniş
- **Kateqoriyalar** (`/categories`): Məhsul kateqoriyaları

## API Endpoints

- `/api/auth/*` - NextAuth.js authentication
- `/api/products` - Məhsul API
- `/api/cart` - Səbət API
- `/api/orders` - Sifariş API

## Deployment

### Vercel (Tövsiyə olunur)

1. Vercel hesabı yarat
2. GitHub repository-ni bağla
3. Environment dəyişənlərini əlavə et
4. Deploy et

### Digər Platformalar

- Netlify
- Railway
- DigitalOcean App Platform

## Təkmilləşdirmə

- [ ] Real-time səbət sinxronizasiyası
- [ ] Wishlist funksiyası
- [ ] Məhsul rəyləri və dəyərləndirmələr
- [ ] Email bildirişləri
- [ ] Admin paneli
- [ ] SEO optimizasiyası
- [ ] PWA dəstəyi

## Kontribusiya

1. Fork et
2. Feature branch yarat (`git checkout -b feature/amazing-feature`)
3. Commit et (`git commit -m 'Add amazing feature'`)
4. Push et (`git push origin feature/amazing-feature`)
5. Pull Request yarat

## Lisenziya

Bu layihə MIT lisenziyası altında yayımlanır.

## Əlaqə

- **Email**: info@sahibparfumeriya.az
- **Telefon**: +994 50 123 45 67
- **Ünvan**: Bakı şəhəri, Nərimanov rayonu, Atatürk prospekti 123

---

© 2024 Sahib Parfumeriya. Bütün hüquqlar qorunur.
# Build cache refresh
# Force Vercel build refresh - Fri Sep 12 19:28:56 +04 2025
# Force Vercel build refresh - Fri Sep 12 19:32:00 +04 2025
# Force Vercel build refresh - Fri Sep 12 19:35:54 +04 2025
