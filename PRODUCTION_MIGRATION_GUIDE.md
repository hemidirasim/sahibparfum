# Production Migration Guide - Password Reset Fields

## Problem
Production database-də `users` table-də `resetToken` və `resetTokenExpiry` sütunları yoxdur. Bu səbəbdən şifrə sıfırlama funksiyası 500 xətası verir.

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

1. Şifrə sıfırlama səhifəsinə gedin: https://sahibparfum.az/auth/forgot-password
2. Mövcud bir email ünvanı daxil edin
3. Email gəlməli və link düzgün işləməlidir

## Files Modified

- `prisma/schema.prisma` - Schema güncəlləndi
- `app/api/auth/forgot-password/route.ts` - API endpoint əlavə edildi
- `app/auth/forgot-password/page.tsx` - Frontend səhifəsi əlavə edildi
- `app/auth/reset-password/page.tsx` - Reset səhifəsi əlavə edildi
- `lib/email.ts` - Email funksiyaları əlavə edildi

## Environment Variables

Production-da aşağıdakı environment variable-ları təyin edin:

```
NEXTAUTH_URL=https://sahibparfum.az
RESEND_API_KEY=re_VAVtnWsv_33eJkyHS18mkNt35ZfTXUNH2
```
