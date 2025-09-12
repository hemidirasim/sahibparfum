# Vercel Environment Variables Setup

## Problem
Production site-də United Payment API işləmir çünki environment variables yoxdur.

## Həll

### 1. Vercel Dashboard-a Daxil Olun
- https://vercel.com/dashboard
- `sahibparfum` project-ini seçin
- **Settings** > **Environment Variables**

### 2. Əlavə Ediləcək Variables

#### United Payment Configuration
```
UNITED_PAYMENT_EMAIL=a.hasan@aurora.com.az
UNITED_PAYMENT_PASSWORD=YmTc?17J6g.w
UNITED_PAYMENT_PARTNER_ID=your_partner_id
UNITED_PAYMENT_ENV=production
```

#### United Payment URLs
```
UNITED_PAYMENT_CALLBACK_URL=https://sahibparfum.az/api/payment/callback
UNITED_PAYMENT_SUCCESS_URL=https://sahibparfum.az/order-success
UNITED_PAYMENT_FAILURE_URL=https://sahibparfum.az/checkout?payment=failed
UNITED_PAYMENT_CANCEL_URL=https://sahibparfum.az/checkout?payment=cancelled
UNITED_PAYMENT_DECLINE_URL=https://sahibparfum.az/checkout?payment=declined
```

#### NextAuth Configuration
```
NEXTAUTH_URL=https://sahibparfum.az
NEXTAUTH_SECRET=your-production-secret-key
```

#### Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_cUIsBS0RwM2F@ep-bitter-truth-adiz4bfw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Əlavə Etmək Üçün:
1. **Add New** düyməsinə basın
2. **Name** və **Value** doldurun
3. **Environment** seçin: **Production** (və ya **All**)
4. **Save** edin

### 4. Redeploy
Variables əlavə edildikdən sonra:
- **Deployments** bölməsinə gedin
- **Redeploy** edin

### 5. Test
Redeploy edildikdən sonra:
- https://sahibparfum.az/checkout
- Kart ödənişi test edin
- United Payment səhifəsinə yönləndirilməni yoxlayın

## Hazırki Status
- ✅ Local: Düzgün işləyir
- ✅ Test API: Düzgün işləyir
- ❌ Production: Environment variables yoxdur
