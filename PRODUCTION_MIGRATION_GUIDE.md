# Production Migration Guide - Database Schema Updates

## Problem 1: Password Reset Fields
Production database-də `users` table-də `resetToken` və `resetTokenExpiry` sütunları yoxdur. Bu səbəbdən şifrə sıfırlama funksiyası 500 xətası verir.

## Problem 2: Transaction ID Field
Production database-də `orders` table-də `transactionId` sütunu yoxdur. Bu səbəbdən admin panel-də ödəniş statusu yoxlanması işləmir.

## Solution
Aşağıdakı addımları izləyin:

### Option 1: Vercel CLI ilə (Recommended)

1. Vercel CLI-ni quraşdırın:
```bash
npm i -g vercel
```

2. Vercel-də login olun:
```bash
vercel login
```

3. Project-ə bağlanın:
```bash
vercel link
```

4. Migration script-ini çalıştırın:
```bash
vercel env pull .env.production
npm run migrate:production
```

### Option 2: Manual SQL (Database Admin Panel)

Əgər database admin panel-inə girişiniz varsa, aşağıdakı SQL-i çalıştırın:

```sql
-- Add password reset fields to users table
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);

-- Add indexes for better performance
CREATE INDEX "users_resetToken_idx" ON "users"("resetToken");

-- Add transactionId field to orders table
ALTER TABLE "orders" ADD COLUMN "transactionId" INTEGER;

-- Add index for transactionId for better query performance
CREATE INDEX "orders_transactionId_idx" ON "orders"("transactionId");
```

### Option 3: Prisma Studio (Local)

1. Production DATABASE_URL-ini local .env faylına kopyalayın
2. Prisma Studio-nu açın:
```bash
npx prisma studio
```
3. Users table-də manual olaraq sütunları əlavə edin

## Verification

Migration tamamlandıqdan sonra:

1. **Password Reset Test:**
   - Şifrə sıfırlama səhifəsinə gedin: https://sahibparfum.az/auth/forgot-password
   - Mövcud bir email ünvanı daxil edin
   - Email gəlməli və link düzgün işləməlidir

2. **Payment Status Check Test:**
   - Admin panel-ə daxil olun
   - Sifarişlər səhifəsinə gedin
   - Transaction ID olan sifarişdə yeşil CheckCircle düyməsini test edin
   - Ödəniş statusu yoxlanmalı və yenilənməlidir

## Files Modified

**Database Schema:**
- `prisma/schema.prisma` - Order model-inə transactionId field əlavə edildi
- `prisma/migrations/20250918160000_add_transaction_id_to_orders/migration.sql` - Migration script

**Password Reset:**
- `app/api/auth/forgot-password/route.ts` - API endpoint əlavə edildi
- `app/auth/forgot-password/page.tsx` - Frontend səhifəsi əlavə edildi
- `app/auth/reset-password/page.tsx` - Reset səhifəsi əlavə edildi
- `lib/email.ts` - Email funksiyaları əlavə edildi

**Payment Status Check:**
- `lib/united-payment-auth.ts` - Transaction status check funksiyası
- `app/api/payment/check-status/route.ts` - Status check API endpoint
- `app/admin/orders/page.tsx` - Admin panel-də status check düyməsi
- `app/api/admin/orders/route.ts` - Admin orders API transactionId ilə

## Environment Variables

Production-da aşağıdakı environment variable-ları təyin edin:

```
NEXTAUTH_URL=https://sahibparfum.az
RESEND_API_KEY=re_VAVtnWsv_33eJkyHS18mkNt35ZfTXUNH2
```
