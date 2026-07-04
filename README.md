# Tengrius Coffee

Alıcı ve satıcıları tek platformda buluşturan çift taraflı bir çiğ kahve pazar yeri (marketplace) — bir ERP modülü değil, bağımsız bir SaaS ürünü.

Tengrius ailesinin bir parçasıdır — tech stack aynı, ancak veri modeli ve yetkilendirme mantığı `company_id` tabanlı çok kiracılı yapıdan farklı olarak **kullanıcı → organizasyon (buyer/seller) → üyelik seviyesi** modeline dayanır (bkz. proje kökündeki `kahve-borsasi-teknik-brief.md`).

## Yığın

- **Frontend:** Next.js 16 (App Router, Turbopack) + Tailwind CSS — `frontend/`
- **Backend:** NestJS + TypeScript + Prisma v5 — `backend/`
- **Veritabanı:** Supabase (PostgreSQL) — ayrı proje/instance
- **Deploy:** Frontend → Vercel (Hobby), Backend → Render (Free)

## Kurulum (yerel geliştirme)

### 1. Supabase projesi

1. [supabase.com](https://supabase.com) üzerinde yeni proje oluştur.
2. Project Settings → Database → Connection string:
   - **Pooler (6543)** → `DATABASE_URL`
   - **Direct (5432)** → `DIRECT_URL`

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # DATABASE_URL, DIRECT_URL, JWT_SECRET doldur
npx prisma migrate dev --name init
npm run seed            # örnek satıcı + alıcı organizasyonu + 1 ürün
npm run start:dev       # http://localhost:3001
```

Seed sonrası giriş bilgileri:
- Satıcı: `satici@tengrius-coffee.local` / `satici123`
- Alıcı: `alici@tengrius-coffee.local` / `alici123`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev              # http://localhost:3000
```

## Deployment

### Backend → Render

1. Render panelinde **New + → Blueprint**, bu repoyu seç (kök dizindeki `render.yaml` otomatik algılanır).
2. `DATABASE_URL` ve `DIRECT_URL` değerlerini panelden gir (Supabase'ten).
3. Deploy sonrası backend adresi: `https://tengrius-coffee-backend.onrender.com`

### Frontend → Vercel

1. Vercel'de yeni proje, **Root Directory: `frontend`**.
2. Environment Variables: `NEXT_PUBLIC_API_URL=https://tengrius-coffee-backend.onrender.com`
3. Deploy sonrası Vercel adresini Render'daki `CORS_ORIGINS` değişkenine ekle.
4. Vercel Hobby planı commit'lerde ek yazar (co-author) e-postasını reddeder — bu repoya commit atarken `Co-Authored-By` eklenmemelidir.

### UptimeRobot

Render free tier'ın uykuya dalmaması için `https://tengrius-coffee-backend.onrender.com/` adresine 5 dakikada bir ping ekleyin (backend'de `GET /` zaten `@Public()` health endpoint'i olarak tanımlı).

## MVP kapsamı (bkz. teknik brief §6)

Tamamlanan iskelet: Auth (kayıt/giriş, organizasyon oluşturma), Organizations (üyelik yükseltme — demo/manuel), Products (CRUD + filtreleme), Offers (teklif ver/kabul/red — Premium), Price Alerts (CRUD + 30 dakikada bir cron kontrolü), Orders (banka havalesi akışı — admin/satıcı onayı), Market (ana sayfa borsa verisi + fiyat geçmişi).

### Faz 2 (henüz yok)

- MFA (Tengrius RE'deki otplib deseni referans alınabilir)
- Gerçek ödeme sağlayıcısı entegrasyonu (iyzico/PayTR/Stripe) — kredi kartı akışı şu an backend'de bilinçli olarak reddediliyor (bkz. `orders.controller.ts`)
- SMS/push bildirim sağlayıcı entegrasyonu (şu an sadece `NotificationLog`'a yazılıyor + konsola basılıyor)
- Kullanıcı puanlama/güven skoru, satıcı doğrulama akışı (şema hazır: `trust_score`, `verified`)
- Admin panel (kullanıcı/ürün onayı) — şu an yalnızca yer tutucu sayfa var
- Çoklu dil desteği (next-intl)

## Bilinen kısıtlamalar

- Bir kullanıcı şu an yalnızca kayıt sırasında oluşturduğu tek organizasyona bağlanır (şema N-N'e izin verir, çoklu organizasyon arası geçiş arayüzü yok).
- Ürün silme işlemi soft delete'tir — `status = 'ARCHIVED'`, kayıt DB'den silinmez.
- Premium üyelik kontrolü JWT claim'ine dayanır — üyelik yükseltildikten sonra oturumun yenilenmesi (yeniden giriş) gerekir.
