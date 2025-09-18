# URGENT: Production Database Migration Required

## Problem
Production-da `orders` table-də `transactionId` sütunu yoxdur. Bu səbəbdən admin panel-də sifarişlər səhifəsi 500 xətası verir.

## Immediate Fix Required
Production database-də aşağıdakı SQL-i çalıştırın:

```sql
-- Add transactionId column to orders table
ALTER TABLE "orders" ADD COLUMN "transactionId" INTEGER;

-- Add index for better performance
CREATE INDEX "orders_transactionId_idx" ON "orders"("transactionId");
```

## Verification
Migration tamamlandıqdan sonra:
1. Admin panel-ə daxil olun
2. Sifarişlər səhifəsinə gedin
3. Səhifə yüklənməlidir (500 xətası olmamalıdır)

## Alternative: Vercel CLI
Əgər Vercel CLI quraşdırılıbsa:
```bash
vercel env pull .env.production
npm run migrate:production
```

## Files Affected
- `app/api/admin/orders/route.ts` - Orders list API
- `app/api/admin/orders/[id]/route.ts` - Individual order API
- `app/admin/orders/page.tsx` - Admin orders page

Bu migration tələb olunur çünki kod `transactionId` field-ini istifadə edir amma database-də yoxdur.
