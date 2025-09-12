# Production Environment Setup

## Problem
Production site-də United Payment API authentication xətası var:
```
POST https://sahibparfum.az/api/payment/united-payment 500 (Internal Server Error)
Payment creation error: {error: 'Authentication failed', message: 'Ödəniş sistemi ilə əlaqə qura bilmədi. Administratorla əlaqə saxlayın.', code: 'AUTH_FAILED'}
```

## Həll

### 1. Vercel Environment Variables Əlavə Edin

Vercel Dashboard-da aşağıdakı environment variables-ı əlavə edin:

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

### 2. Vercel-də Əlavə Etmək Üçün:
1. Vercel Dashboard-a daxil olun
2. Project Settings > Environment Variables
3. Yuxarıdakı variables-ı əlavə edin
4. Redeploy edin

### 3. United Payment Credentials Aktivləşdirmək

**Vacib:** `a.hasan@aurora.com.az` credentials-ı production environment üçün aktivləşdirilməlidir.

United Payment Azerbaijan ilə əlaqə saxlayın:
- Production API access aktivləşdirmək
- Credentials-ı production environment üçün konfiqurasiya etmək

### 4. Test

Environment variables əlavə edildikdən sonra:
1. Site-i redeploy edin
2. Checkout səhifəsində kart ödənişi test edin
3. United Payment səhifəsinə yönləndirilməni yoxlayın

## Hazırki Status
- ✅ Local development: Düzgün işləyir
- ✅ Test environment: Düzgün işləyir  
- ❌ Production environment: Credentials aktivləşdirilməli
