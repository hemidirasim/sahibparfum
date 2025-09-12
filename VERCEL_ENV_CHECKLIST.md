# Vercel Environment Variables Checklist

## Problem
Production site-də hələ də `500 Internal Server Error` var.

## Həll

### 1. Vercel Dashboard-a Daxil Olun
- https://vercel.com/dashboard
- `sahibparfum` project-ini seçin

### 2. Environment Variables Yoxlayın
- **Settings** > **Environment Variables**
- Aşağıdakı variables-ın olduğunu yoxlayın:

### 3. Tələb Olunan Variables

#### A) United Payment Configuration
```
UNITED_PAYMENT_EMAIL=a.hasan@aurora.com.az
UNITED_PAYMENT_PASSWORD=YmTc?17J6g.w
UNITED_PAYMENT_ENV=production
```

**Note:** `UNITED_PAYMENT_PARTNER_ID` optional parametrdir və lazım deyil.

#### B) Database Configuration
```
DATABASE_URL=postgresql://neondb_owner:npg_cUIsBS0RwM2F@ep-bitter-truth-adiz4bfw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### C) NextAuth Configuration
```
NEXTAUTH_URL=https://sahibparfum.az
NEXTAUTH_SECRET=your-production-secret-key
```

### 4. Əlavə Etmək Üçün
1. **Add New** düyməsinə basın
2. **Name** və **Value** doldurun
3. **Environment** seçin: **Production** (və ya **All**)
4. **Save** edin

### 5. Redeploy
Variables əlavə edildikdən sonra:
- **Deployments** bölməsinə gedin
- **Redeploy** düyməsinə basın

### 6. Test
- https://sahibparfum.az/checkout
- Kart ödənişi test edin

## Yoxlama Siyahısı
- [ ] Vercel Dashboard-a daxil oldunuz
- [ ] Settings > Environment Variables-ə gedin
- [ ] UNITED_PAYMENT_EMAIL=a.hasan@aurora.com.az əlavə edin
- [ ] UNITED_PAYMENT_PASSWORD=YmTc?17J6g.w əlavə edin
- [ ] UNITED_PAYMENT_ENV=production əlavə edin
- [ ] ~~UNITED_PAYMENT_PARTNER_ID~~ (lazım deyil)
- [ ] DATABASE_URL əlavə edin
- [ ] NEXTAUTH_URL əlavə edin
- [ ] NEXTAUTH_SECRET əlavə edin
- [ ] Environment: Production seçin
- [ ] Save edin
- [ ] Redeploy edin
- [ ] Test edin

## Əgər Hələ Də Xəta Varsa
Vercel Environment Variables ekranının screenshot-ını göndərin.
