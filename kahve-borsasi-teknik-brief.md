# Kahve Borsası Platformu — Teknik Brief (v1.0)

> Proje kod adı: **Tengrius Coffee** (öneri) — Tengrius tech stack'ini paylaşan, bağımsız bir SaaS ürünü.

---

## 1. Proje Konumlandırması

Bu proje Tengrius ERP'nin (halı POS/ERP) bir modülü **değildir**. Tengrius RE'de olduğu gibi:

- **Ayrı repo:** `tengrius-coffee` (`baamkilic-gs` altında)
- **Ayrı Supabase projesi** (ayrı `DATABASE_URL` / `DIRECT_URL`)
- **Ayrı Vercel + Render deploy'u**
- **Aynı tech stack:** Next.js 16 (App Router, Turbopack) + NestJS + Prisma v5 + Supabase (PostgreSQL)
- **Kendi görsel kimliği:** Kahve temalı — öneri: koyu kahverengi/kremsi ton + altın vurgu (borsa/premium hissi için Tengrius RE'nin lacivert/altın paletine paralel ama kahve tonlarında)

Sebep: Bu bir çok-kiracılı (multi-tenant) ERP değil, **çift taraflı bir pazar yeri (marketplace)** — alıcı ve satıcı aynı platformda birbirine karşı işlem yapıyor. Veri modeli ve yetkilendirme mantığı Tengrius ERP'den kökten farklı, bu yüzden `company_id` tabanlı tenant izolasyonu yerine **kullanıcı → rol (buyer/seller) → üyelik seviyesi** modeli kullanılacak.

---

## 2. Kullanıcı Rolleri & Üyelik Modeli

### 2.1 Roller
| Rol | Açıklama |
|-----|----------|
| `BUYER` | Ürün görüntüler, teklif verir (premium ise), satın alır |
| `SELLER` | Ürün (parti/lot) girer, teklifleri yönetir, satış yapar |
| `ADMIN` | Platform yönetimi — kullanıcı/ürün onayı, üyelik yönetimi |

Bir kullanıcı hem alıcı hem satıcı olabilir mi? → **Evet**, rol kullanıcıya değil, kullanıcının açtığı **hesap profiline (organization)** bağlı olmalı. Öneri: `users` → `organizations` (1-N), her organization bir `type` alanı taşır (`BUYER`, `SELLER`, `BOTH`).

### 2.2 Üyelik Seviyeleri
| Seviye | Yetkiler |
|--------|----------|
| **Standart** | Ürünleri görüntüleme, borsa fiyatlarını görme |
| **Premium** | + Teklif verme, fiyat alarmı kurma, satın alma işlemi yapma, (satıcıysa) öne çıkan listeleme |

Üyelik durumu `organizations.membership_tier` + `membership_expires_at` alanlarıyla tutulur. Ödeme entegrasyonu (bkz. §7) üyelik yenilemesini tetikler.

---

## 3. Veritabanı Şeması (Prisma — taslak)

```prisma
// ==== Kullanıcı & Organizasyon ====

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  phone          String?
  password_hash  String
  full_name      String
  role           SystemRole @default(MEMBER) // MEMBER | ADMIN
  mfa_enabled    Boolean  @default(false)
  mfa_secret     String?
  created_at     DateTime @default(now())

  organizations  OrganizationMember[]
}

model Organization {
  id                    String   @id @default(uuid())
  name                  String
  type                  OrgType  // BUYER | SELLER | BOTH
  country               String?
  membership_tier       MembershipTier @default(STANDARD) // STANDARD | PREMIUM
  membership_expires_at DateTime?
  trust_score           Int      @default(0)   // ileride: puanlama sistemi
  verified              Boolean  @default(false) // satıcı doğrulama
  created_at            DateTime @default(now())

  members     OrganizationMember[]
  products    Product[]
  offers      Offer[]
  orders      Order[]         @relation("BuyerOrders")
  sellerOrders Order[]        @relation("SellerOrders")
  priceAlerts PriceAlert[]
}

model OrganizationMember {
  id              String   @id @default(uuid())
  organization_id String
  user_id         String
  role_in_org     String   // OWNER | MANAGER | STAFF

  organization    Organization @relation(fields: [organization_id], references: [id])
  user            User         @relation(fields: [user_id], references: [id])

  @@unique([organization_id, user_id])
}

enum SystemRole { MEMBER ADMIN }
enum OrgType { BUYER SELLER BOTH }
enum MembershipTier { STANDARD PREMIUM }

// ==== Ürün (Çiğ Kahve) ====

model Product {
  id              String   @id @default(uuid())
  seller_org_id   String
  title           String
  country         String
  region          String?
  bean_type       String   // Arabica | Robusta | Blend
  harvest_year    Int?
  processing_method String? // Washed | Natural | Honey ...
  moisture_pct    Float?
  cupping_notes   String?  @db.Text
  other_specs     Json?    // serbest teknik alanlar

  pricing_unit    PricingUnit // CONTAINER | BAG
  price_per_unit  Decimal  @db.Decimal(12,2)
  currency        String   @default("USD")
  quantity_available Int
  is_featured     Boolean  @default(false) // premium satıcı öne çıkarma
  status          ProductStatus @default(ACTIVE) // ACTIVE | SOLD_OUT | ARCHIVED
  created_at      DateTime @default(now())

  seller          Organization @relation(fields: [seller_org_id], references: [id])
  offers          Offer[]
  priceAlerts     PriceAlert[]
  priceHistory    PriceHistory[]
}

enum PricingUnit { CONTAINER BAG }
enum ProductStatus { ACTIVE SOLD_OUT ARCHIVED }

model PriceHistory {
  id          String   @id @default(uuid())
  product_id  String
  price       Decimal  @db.Decimal(12,2)
  recorded_at DateTime @default(now())

  product     Product @relation(fields: [product_id], references: [id])
}

// ==== Teklif Sistemi ====

model Offer {
  id              String   @id @default(uuid())
  product_id      String
  buyer_org_id    String
  offer_price     Decimal  @db.Decimal(12,2)
  quantity        Int
  message         String?  @db.Text
  status          OfferStatus @default(PENDING) // PENDING | ACCEPTED | REJECTED | EXPIRED
  created_at      DateTime @default(now())

  product         Product @relation(fields: [product_id], references: [id])
  buyer           Organization @relation(fields: [buyer_org_id], references: [id])
}

enum OfferStatus { PENDING ACCEPTED REJECTED EXPIRED }

// ==== Fiyat Alarmı ====

model PriceAlert {
  id              String   @id @default(uuid())
  organization_id String
  product_id      String?  // belirli ürün, veya null ise genel (ülke+tür bazlı)
  bean_type       String?
  country         String?
  target_price    Decimal  @db.Decimal(12,2)
  direction       AlertDirection // BELOW | ABOVE
  channel_email   Boolean  @default(true)
  channel_sms     Boolean  @default(false)
  channel_push    Boolean  @default(true)
  is_active       Boolean  @default(true)
  triggered_at    DateTime?

  organization    Organization @relation(fields: [organization_id], references: [id])
  product         Product? @relation(fields: [product_id], references: [id])
}

enum AlertDirection { BELOW ABOVE }

// ==== Satın Alma / Sipariş ====

model Order {
  id              String   @id @default(uuid())
  product_id      String
  buyer_org_id    String
  seller_org_id   String
  quantity        Int
  unit_price      Decimal  @db.Decimal(12,2)
  total_amount    Decimal  @db.Decimal(14,2)
  currency        String   @default("USD")
  payment_method  PaymentMethod // CREDIT_CARD | BANK_TRANSFER
  payment_status  PaymentStatus @default(PENDING)
  order_status    OrderStatus  @default(CREATED)
  created_at      DateTime @default(now())

  buyer           Organization @relation("BuyerOrders", fields: [buyer_org_id], references: [id])
  seller          Organization @relation("SellerOrders", fields: [seller_org_id], references: [id])
}

enum PaymentMethod { CREDIT_CARD BANK_TRANSFER }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
enum OrderStatus { CREATED CONFIRMED SHIPPED COMPLETED CANCELLED }

// ==== Bildirim Log ====

model NotificationLog {
  id          String   @id @default(uuid())
  organization_id String
  channel     String   // EMAIL | SMS | PUSH
  event_type  String   // PRICE_ALERT | ORDER_CONFIRM | OFFER_UPDATE
  payload     Json?
  sent_at     DateTime @default(now())
}
```

**Notlar:**
- Tüm ana tablolarda `Organization` merkezli ilişki var; Tengrius ERP'deki `company_id` filtreleme mantığına benzer şekilde burada `organization_id` bazlı yetkilendirme yapılacak.
- `PriceHistory` tablosu "canlı piyasa grafikleri" (opsiyonel özellik) için baştan eklendi — maliyeti düşük, ileride grafik çizimini kolaylaştırır.
- `trust_score` ve `verified` alanları MVP'de kullanılmasa da şemaya eklendi ki ileride puanlama/doğrulama sistemi migration gerektirmeden devreye alınabilsin.

---

## 4. Backend Modülleri (NestJS)

```
src/
├── auth/              # JWT auth, MFA (Tengrius ERP ile aynı otplib yaklaşımı)
├── organizations/     # Organizasyon CRUD, üyelik seviyesi yönetimi
├── products/          # Ürün (çiğ kahve) CRUD, filtreleme (ülke/tür/fiyat)
├── offers/            # Teklif oluşturma/kabul/red — sadece PREMIUM guard
├── price-alerts/      # Alarm CRUD + cron job (fiyat kontrolü)
├── orders/            # Satın alma akışı, ödeme durumu
├── payments/          # Ödeme sağlayıcı entegrasyonu (bkz. §7)
├── notifications/     # Email (SendGrid/Resend), SMS (NetGSM — Tengrius'ta mevcut), Push
├── market/            # Ana sayfa borsa verisi, öne çıkan ürünler, fiyat geçmişi
└── common/            # guards (PremiumGuard), serialize helpers
```

**Kritik guard:** `PremiumGuard` — teklif verme, alarm kurma ve satın alma endpoint'lerinde `organization.membership_tier === 'PREMIUM'` kontrolü yapar. Tengrius ERP'deki global `APP_GUARD` (JWT) yaklaşımına ek katman olarak eklenir.

**Cron job:** `price-alerts` modülünde her ürün fiyat güncellemesinde (veya periyodik) aktif alarmlar taranır, eşik geçildiyse `notifications` modülü tetiklenir.

---

## 5. Frontend Sayfaları (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                 # Ana sayfa — borsa fiyatları, öne çıkanlar
│   ├── urunler/[id]/page.tsx    # Ürün detay + "Teklif Al" / "Satın Al"
│   └── giris/, kayit/           # Login/Register
├── (app)/
│   ├── panel/                   # Kullanıcı paneli (buyer/seller ortak shell)
│   │   ├── urunlerim/           # (seller) ürün yönetimi
│   │   ├── tekliflerim/         # gelen/giden teklifler
│   │   ├── alarmlarim/          # fiyat alarmları
│   │   ├── siparislerim/        # satın alma geçmişi
│   │   └── uyelik/              # üyelik yükseltme (Standart → Premium)
│   └── admin/                   # Admin panel — kullanıcı/ürün onayı
```

---

## 6. MVP Kapsamı vs Faz 2

### MVP (Faz 1)
1. Auth + Organizasyon (buyer/seller) kaydı
2. Ürün girişi (çiğ kahve + expertiz alanları)
3. Ana sayfa: borsa fiyat listesi + öne çıkan (premium) ürünler
4. Teklif sistemi (sadece premium)
5. Standart/Premium üyelik ayrımı (manuel/basit ödeme ile başlangıç)
6. Fiyat alarmı (email bildirim önceliği; SMS/push Faz 2)
7. Satın alma akışı — **ödeme entegrasyonu olmadan, "havale bildirimi + admin onayı" ile başlanması önerilir** (bkz. §7)

### Faz 2 (Opsiyonel Geliştirme — brief'te belirtilen)
- Canlı piyasa grafikleri (`PriceHistory` şeması hazır)
- Kullanıcı puanlama / güven skoru (`trust_score` alanı hazır)
- Satıcı doğrulama sistemi (`verified` alanı hazır)
- Çoklu dil desteği (next-intl önerilir)
- ERP/stok entegrasyonu (Tengrius ERP ile API köprüsü kurulabilir)
- Gerçek zamanlı kredi kartı ödeme (iyzico/Stripe)
- SMS bildirim (NetGSM — Tengrius ERP'de zaten entegre, aynı hesap kullanılabilir)

---

## 7. Ödeme Sistemi — Önemli Uyarı

Brief'te "Kredi kartı" ve "Banka havalesi" ödeme yöntemleri isteniyor. Teknik olarak:

- **Banka havalesi:** Kolay — kullanıcı "Havale yaptım" der, sipariş `PENDING` kalır, admin dekont kontrolüyle `PAID`'e çeker. MVP için önerilen yöntem budur.
- **Kredi kartı:** Gerçek kart işlemi için bir ödeme sağlayıcı (iyzico, PayTR, Stripe vb.) entegrasyonu şart — platform kart bilgisini asla kendi sunucusunda tutmamalı, sağlayıcının hosted checkout / tokenization akışı kullanılmalı. Bu, MVP sonrası ayrı bir entegrasyon işi olarak planlanmalı (PCI-DSS kapsamı dışında kalmak için).

Bu konuda ben ödeme sağlayıcısı seçimi veya entegrasyonu için genel teknik yönlendirme yapabilirim, ancak gerçek bir finansal işlemi başlatma/tamamlama gibi bir aksiyonu senin adına gerçekleştiremem — bu tamamen geliştirme/kod tarafında kalan bir konu, sadece netlik için belirtmek istedim.

---

## 8. Sonraki Adımlar

1. Repo iskeleti: `tengrius-coffee` reposunu `baamkilic-gs` altında oluştur (Tengrius RE ile aynı pattern)
2. Ayrı Supabase projesi aç, `DATABASE_URL`/`DIRECT_URL` ayarla
3. Yukarıdaki Prisma şemasını `schema.prisma`'ya işle, ilk migration'ı çalıştır
4. `auth` modülünü Tengrius ERP'den referans alarak kur (JWT + opsiyonel MFA)
5. MVP sırasıyla: Organizations → Products → Market (ana sayfa) → Offers → Price Alerts → Orders (havale akışı)
6. Görsel kimlik (renk paleti, tipografi) için `frontend-design` prensipleriyle ayrı bir tasarım turu

---

*Bu doküman implementasyon handoff'u için hazırlanmıştır. Tengrius skill dosyasındaki mimari kalıplar (global JWT guard, `@Public()` decorator, Render `;` deploy komutu, Vercel commit email kısıtı) bu projede de geçerlidir ve aynen uygulanmalıdır.*
