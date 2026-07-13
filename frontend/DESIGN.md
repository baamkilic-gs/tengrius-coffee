# DESIGN.md — Tengrius Coffee

> Toprağın sıcaklığını taşıyan, sakin ve güvenilir bir çiğ kahve borsası — el yapımı bir kahve dükkanının davetkârlığı ile B2B ticaretin ciddiyetini birleştirir.

## 1. Visual Theme & Atmosphere

**Style**: Organic Natural × Warm Professional (kahve markasına uyarlanmış)
**Keywords**: topraksı, sıcak, güvenilir, el işi, olgun, sakin, davetkâr, zanaatkâr
**Tone**: Sıcak ve samimi ama ciddi bir ticaret platformu — NOT parlak/yapay, NOT soğuk-kurumsal, NOT oyuncul
**Feel**: Kavurma dükkanının vitrini gibi — ahşap tezgah, kraft kese kâğıdı, taze kavrulmuş çekirdek kokusu hissettiren bir dijital yüz

**Interaction Tier**: L1 — Zarif Statik (sakin giriş animasyonları + zarif hover, scroll-driven efekt yok)
**Dependencies**: CSS only (framework/kütüphane eklenmedi)

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #f5f0e8;              /* sayfa arka planı — sıcak krem */
  --surface: #fefcf9;         /* kart / konteyner yüzeyi */
  --surface-alt: #efe6d6;     /* alternatif section (krema koyulaştırılmış) */
  --surface-hover: #f8f2e6;   /* hover durumundaki yüzey */

  /* Borders */
  --border: #ddd0ba;          /* varsayılan kenarlık */
  --border-hover: #c9973a;    /* hover kenarlık — altın/kehribar */

  /* Text */
  --text: #2b1a12;            /* başlık, önemli metin — koyu kavrulmuş kahve */
  --text-secondary: #6b5c4c;  /* gövde metni */
  --text-tertiary: #9c8b76;   /* etiket, yardımcı bilgi */

  /* Accent */
  --accent: #c4956a;          /* kil/kehribar — CTA, link, aktif durum */
  --accent-hover: #ad7c50;
  --accent-strong: #3b2417;   /* koyu kahve — hero, nav, güçlü vurgu */
  --accent-strong-dark: #241309;

  /* RGB variants for rgba() */
  --bg-rgb: 245, 240, 232;
  --accent-rgb: 196, 149, 106;
  --accent-strong-rgb: 59, 36, 23;

  /* Semantic */
  --success: #5b8c5a;          /* yosun yeşili — onay/verified */
  --error: #b5482f;
  --warning: #c4956a;
}
```

**Color Rules:**
- Tüm renkler CSS değişkeni üzerinden kullanılır — bileşen kodunda hardcoded hex yasak.
- Bir section içinde tek bir vurgu rengi kullanılır (`--accent` veya `--accent-strong`, ikisi asla aynı öğede karışmaz).
- `--success` (yosun yeşili) yalnızca doğrulanmış satıcı rozeti ve olumlu durum etiketleri için kullanılır, dekoratif amaçla değil.

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap');

--font-heading: 'Fraunces', ui-serif, Georgia, serif;
--font-body: 'Source Sans 3', ui-sans-serif, system-ui, -apple-system, sans-serif;
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Fraunces | 44–56px (clamp) | 600 | 1.08 | -0.01em |
| Section H2 | Fraunces | 26–30px | 600 | 1.2 | -0.005em |
| H3 | Fraunces | 18–20px | 600 | 1.3 | — |
| Body | Source Sans 3 | 15–16px | 400 | 1.6 | — |
| Label / Eyebrow | Source Sans 3 | 12px | 600 (uppercase) | 1.4 | 0.14em |
| Mono/Code | ui-monospace | 13px | 400 | 1.5 | — |

**Typography Rules:**
- Başlıklar her zaman `--font-heading` (Fraunces); gövde/form/etiket her zaman `--font-body`.
- Heading weight ≥ 600, gövde weight 400/500.
- **NEVER use**: sistem varsayılan Arial/Helvetica başlıklarda; Comic Sans, gölge/parlak efektli el yazısı fontlar.

**Text Decoration:**
- Hero h1: gradient yok, düz `--text` rengi üzerine yalnızca yumuşak gölge — `text-shadow: 0 2px 10px rgba(0,0,0,0.18)` (koyu hero zemininde okunurluk için, "Warm Professional" kuralına göre soft shadow).
- Section h2 / body: dekorasyon yok — Organic/L1 stilinde başlıklar sade kalır.
- Eyebrow (küçük üst etiket): `letter-spacing: 0.14em` + `border-bottom` yerine altın renk vurgusu, gölge yok.

## 4. Component Stylings

### Buttons
```css
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  cursor: pointer;
}
.btn-primary {
  background: var(--accent);
  color: var(--accent-strong-dark);
  border: none;
}
.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--accent-rgb), 0.35);
}
.btn-primary:active { transform: translateY(0); }
.btn-primary:focus-visible {
  outline: 2px solid var(--accent-strong);
  outline-offset: 2px;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-secondary {
  background: transparent;
  color: inherit;
  border: 1.5px solid currentColor;
  opacity: 0.9;
}
.btn-secondary:hover { background: rgba(255, 255, 255, 0.12); opacity: 1; }
```

### Cards
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(var(--accent-strong-rgb), 0.04);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
  box-shadow: 0 16px 32px rgba(var(--accent-strong-rgb), 0.12);
}
.card:focus-within { border-color: var(--accent); }
```

### Navigation
```css
.nav {
  background: var(--accent-strong);
  color: var(--bg);
  padding: 0.9rem 1.5rem;
}
.nav-link {
  color: var(--bg);
  opacity: 0.85;
  transition: opacity 0.15s ease;
}
.nav-link:hover { opacity: 1; }
.nav-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
```

### Links
```css
.link {
  color: var(--accent-strong);
  text-decoration: underline;
  text-decoration-color: rgba(var(--accent-strong-rgb), 0.35);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s ease;
}
.link:hover { text-decoration-color: var(--accent-strong); }
```

### Tags / Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: rgba(var(--accent-rgb), 0.15);
  color: var(--accent-strong);
}
.badge-verified { background: rgba(91, 140, 90, 0.15); color: var(--success); }
```

### Form Inputs
```css
.input {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0.6rem 0.9rem;
  font-family: var(--font-body);
  font-size: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input:hover { border-color: var(--border-hover); }
.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.18);
}
.input:disabled { opacity: 0.5; }
```

## 5. Layout Principles

**Container:**
- Max width: 1120px (`max-w-5xl` yerine geniş içerik için `max-w-6xl` da kullanılır — panel/tablo sayfaları)
- Padding: 1.5rem (mobil), 2rem (masaüstü)
- Narrow variant (form/metin ağırlıklı): 420px

**Spacing Scale:**
- Section padding: 3.5rem (mobil) / 6rem (masaüstü)
- Component gap: 1rem – 1.5rem
- Card internal padding: 1.5rem

**Grid:**
```css
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
}
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | box-shadow yok, sadece `--border` | Form inputları, tablo satırları |
| Subtle | `0 1px 2px rgba(accent-strong,0.04)` | Kartlar (default) |
| Elevated | `0 16px 32px rgba(accent-strong,0.12)` | Kart hover, dropdown |
| Floating | `0 20px 40px rgba(accent-strong,0.25)` | Modal, hero'daki dönen görsel |

## 7. Animation & Interaction

**Motion Philosophy**: Sakin ve zarif — yalnızca `opacity` ve `transform` kullanılır, ani/sıçramalı hareket yok.
**Tier**: L1 — Zarif Statik

### Dependencies
Yok (saf CSS).

### Entrance Animation
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
.enter-fade-up {
  animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
/* Hero içindeki elemanlar art arda (stagger) görünür */
.enter-fade-up:nth-child(2) { animation-delay: 0.08s; }
.enter-fade-up:nth-child(3) { animation-delay: 0.16s; }
```

### Scroll Behavior
L1 kapsamında scroll-tetiklemeli reveal/parallax **yok**. Sayfa `scroll-behavior: smooth` ile doğal kayar.

### Hover & Focus States
Bkz. §4 (Buttons/Cards/Navigation/Links/Form Inputs) — her etkileşimli öğede hover + focus-visible tanımlı.

### Special Effects
- Fincan buharı (mevcut `steam-rise` keyframe) ve çekirdek float/glow (mevcut `bean-float`, `bean-glow-pulse`) korunur — bunlar sürekli/döngüsel, giriş animasyonu değil, ambiyans efektleridir.
- Kayan kur şeridi (`ticker-scroll`) hover'da durur — mevcut davranış korunur.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

## 8. Do's and Don'ts

### Do
- Başlıklarda her zaman Fraunces, gövdede her zaman Source Sans 3 kullan.
- Her interaktif öğede hover **ve** focus-visible durumu tanımla.
- Kart/konteyner köşelerinde büyük radius (16–20px) kullan — organik/el yapımı hissi bundan gelir.
- Gölgeleri her zaman `--accent-strong` (kahve) tonunda tint'le, nötr gri gölge kullanma.
- Tek section içinde tek vurgu rengi kullan.

### Don't
- ❌ Başlıklarda gradient text veya parlak/glow efekti kullanma (Organic/L1 ile çelişir).
- ❌ Scroll-tetiklemeli reveal, parallax veya pin efekti ekleme (L1 kapsamı dışında).
- ❌ Nötr gri (`#000` tabanlı) box-shadow kullanma — her zaman kahve-tint'li gölge.
- ❌ Küçük radius (< 8px) köşeli kutu kullanma — sert/kurumsal hissi bozar.
- ❌ `--success` (yosun yeşili) rengini dekoratif amaçla kullanma, yalnızca doğrulama/onay anlamında.
- ❌ Emoji ile ikon yerine geçme — mevcut SVG (CoffeeBean/CoffeeCup) veya inline SVG kullan.
- ❌ Body metninde 15px altına inme (okunabilirlik).
- ❌ Aynı sayfada hem `--accent` hem `--accent-strong` aynı bileşende çakışacak şekilde kullanma (ör. altın metin + kahve arka plan üstüne tekrar altın kenarlık gibi kontrast kaybı yaratan kombinasyonlar).

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | Hero 2 kolon, kart grid 3-4 kolon |
| Tablet | 640–1024px | Hero 2 kolon (daralmış), kart grid 2 kolon |
| Mobile | < 640px | Hero tek kolon (metin üstte, görsel altta), kart grid 1 kolon, nav sadeleşir |

**Touch Targets:** minimum 44×44px (buton/link tıklama alanı)
**Collapsing Strategy:** Panel sidebar mobilde üstte yatay scroll edilen bir sekme çubuğuna döner (gelecek iterasyon); şu an için mevcut dikey liste korunur.

```css
@media (max-width: 640px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; }
  .grid-cards { grid-template-columns: 1fr; }
}
```
