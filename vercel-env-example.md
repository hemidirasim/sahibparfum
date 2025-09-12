# Vercel Environment Variables for Production

Production environment-da aşağıdakı environment variables-ı əlavə edin:

## United Payment Configuration
```
UNITED_PAYMENT_EMAIL=a.hasan@aurora.com.az
UNITED_PAYMENT_PASSWORD=YmTc?17J6g.w
UNITED_PAYMENT_PARTNER_ID=your_partner_id
UNITED_PAYMENT_ENV=production
```

## United Payment URLs (Production Domain)
```
UNITED_PAYMENT_CALLBACK_URL=https://sahibparfum.az/api/payment/callback
UNITED_PAYMENT_SUCCESS_URL=https://sahibparfum.az/order-success
UNITED_PAYMENT_FAILURE_URL=https://sahibparfum.az/checkout?payment=failed
UNITED_PAYMENT_CANCEL_URL=https://sahibparfum.az/checkout?payment=cancelled
UNITED_PAYMENT_DECLINE_URL=https://sahibparfum.az/checkout?payment=declined
```

## Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_cUIsBS0RwM2F@ep-bitter-truth-adiz4bfw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## NextAuth Configuration
```
NEXTAUTH_URL=https://sahibparfum.az
NEXTAUTH_SECRET=your-production-secret-key
```

## Vercel Configuration
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

## Vercel-də əlavə etmək üçün:
1. Vercel Dashboard-a daxil olun
2. Project Settings > Environment Variables
3. Yuxarıdakı variables-ı əlavə edin
4. Redeploy edin
