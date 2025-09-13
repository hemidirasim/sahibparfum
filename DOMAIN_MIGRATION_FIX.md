# 🔧 Domain Migration Fix - sahibparfum.az

## ❌ Problem:
Domain `sahibparfum.az`-a keçdikdən sonra admin paneldə şəkil upload problemi yaranıb.

## 🔍 Səbəb:
Domain dəyişikliyindən sonra Vercel Blob konfiqurasiyası yenidən edilməlidir.

## ✅ Həll:

### 1. Vercel Dashboard-da Environment Variables:

#### **BLOB_READ_WRITE_TOKEN yeniləyin:**
```
1. Vercel Dashboard → Project Settings → Environment Variables
2. BLOB_READ_WRITE_TOKEN-i tapın və silin
3. Yeni BLOB_READ_WRITE_TOKEN əlavə edin
4. Production environment üçün təsdiqləyin
```

#### **Domain-specific Environment Variables:**
```
NEXTAUTH_URL=https://sahibparfum.az
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_new_token_here
```

### 2. Vercel Blob Domain Konfiqurasiyası:

#### **Yeni domain üçün Blob token:**
1. **Vercel Dashboard** → **Storage** → **Blob**
2. **New Blob Store** yaradın
3. **Domain**: `sahibparfum.az`
4. **Access Token** alın
5. **Environment Variables**-a əlavə edin

### 3. Next.js Image Configuration:

#### **next.config.js yeniləyin:**
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'douxz7aadfrpj6tw.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'sahibparfum.az',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    unoptimized: true,
  },
}
```

### 4. Upload API Domain Check:

#### **Domain validation əlavə edin:**
```typescript
// app/api/upload/route.ts
const allowedDomains = [
  'sahibparfum.az',
  'localhost:3000',
  'vercel.app'
]

const referer = request.headers.get('referer')
const origin = request.headers.get('origin')

if (!allowedDomains.some(domain => 
  referer?.includes(domain) || origin?.includes(domain)
)) {
  return NextResponse.json({ error: 'Unauthorized domain' }, { status: 403 })
}
```

## 🚀 Deployment Addımları:

### 1. Environment Variables Yeniləyin:
```bash
# Vercel CLI ilə
vercel env add BLOB_READ_WRITE_TOKEN production
vercel env add NEXTAUTH_URL production
```

### 2. Redeploy Edin:
```bash
vercel --prod
```

### 3. Test Edin:
1. Admin panel → Products → New Product
2. Şəkil yükləyin
3. Console log-ları yoxlayın

## 🔍 Debugging:

### Upload API Logs:
```javascript
console.log('Domain check:', {
  referer: request.headers.get('referer'),
  origin: request.headers.get('origin'),
  hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  domain: process.env.NEXTAUTH_URL
})
```

### Vercel Blob Status:
```javascript
console.log('Blob configuration:', {
  tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length,
  tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20),
  domain: process.env.NEXTAUTH_URL
})
```

## 📋 Checklist:

- [ ] Vercel Dashboard-da BLOB_READ_WRITE_TOKEN yeniləyin
- [ ] NEXTAUTH_URL sahibparfum.az olaraq təyin edin
- [ ] next.config.js-də domain patterns yeniləyin
- [ ] Upload API-də domain validation əlavə edin
- [ ] Redeploy edin
- [ ] Test edin

## 🎯 Gözlənilən Nəticə:
Domain dəyişikliyindən sonra admin paneldə şəkil upload işləyəcək.
