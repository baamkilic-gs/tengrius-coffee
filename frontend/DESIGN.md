# DESIGN.md

> Bir çiğ kahve partisinin çuvalındaki etiket kadar net: her rakam, her rozet, her referans numarası ilk bakışta okunur.

## 1. Visual Theme & Atmosphere

**Style**: Teknik Kahve Etiketi (Technical Coffee Label)
**Keywords**: net, teknik, sıcak-nötr, veri-öncelikli, güvenilir, kağıt dokusu, etiket tipografisi, ölçülü
**Tone**: Bir kahve ihracatçısının parti etiketi — bilgi yoğun ama düzenli, samimi ama ciddi. NOT rustik/el yapımı, NOT kurumsal-soğuk, NOT dekoratif.
**Feel**: Bir çuval kahvenin üzerindeki spesifikasyon etiketini okur gibi — köken, tür, nem oranı, parti no hepsi tek bakışta, hizalı ve güvenilir.

**Interaction Tier**: L2 (Akıcı etkileşim)
**Dependencies**: CSS only + native IntersectionObserver (React hook) — GSAP/Lenis gerekmez, panel/tablo ağırlıklı bir B2B araç için performans önceliklidir.

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #F7F4EE;              /* sayfa zemini — sıcak kağıt tonu */
  --surface: #FFFFFF;         /* kart/konteyner */
  --surface-alt: #EFEAE1;     /* alternatif section, hover zemin */
  --surface-hover: #F1ECE3;

  /* Borders */
  --border: #DED6C7;
  --border-hover: #C8763A;

  /* Text */
  --text: #241B14;            /* başlık, önemli metin — neredeyse-siyah kahve */
  --text-secondary: #5B4F42;  /* gövde metni */
  --text-tertiary: #8A7D6C;   /* etiket, ikincil bilgi */

  /* Accent */
  --accent: #C8763A;          /* kehribar/amber — CTA, link, aktif durum */
  --accent-hover: #AD5F29;
  --accent-light: #E8A56D;    /* rozet zemin, hafif vurgu */

  /* RGB variants for rgba() */
  --bg-rgb: 247, 244, 238;
  --accent-rgb: 200, 118, 58;
  --text-rgb: 36, 27, 20;

  /* Semantic */
  --success: #4A7A3D;
  --success-bg: #E8EFE2;
  --error: #B5482F;
  --error-bg: #F5E6E1;
  --warning: #B8862E;

  /* Kahve borsası koyu tonu (nav, ticker, footer) */
  --coffee-dark: #241B14;
  --coffee-dark-alt: #322419;
}
```

**Color Rules:**
- Tüm renkler CSS değişkeni üzerinden kullanılır — hardcoded hex yasak.
- Tek bir vurgu rengi (`--accent`) var; her section'da yalnızca bu renk CTA/aktif-durum olarak kullanılır, ikinci bir "marka rengi" icat edilmez.
- Durum renkleri (`--success`/`--error`/`--warning`) yalnızca gerçek durum bildirimi için kullanılır (kabul/red/uyarı), dekoratif amaçla değil.
- Koyu tonlar (`--coffee-dark`) yalnızca nav, ticker ve footer gibi "çerçeve" alanlarında kullanılır — sayfa içeriği hep açık zemin üzerinde kalır.

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```
```css
--font-heading: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
--font-body: 'Space Grotesk', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'Consolas', monospace;
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Space Grotesk | 28-36px | 700 | 1.15 | -0.01em |
| Section H2 | Space Grotesk | 22-24px | 600 | 1.25 | normal |
| H3 | Space Grotesk | 16-18px | 600 | 1.3 | normal |
| Body | Space Grotesk | 14-15px | 400 | 1.55 | normal |
| Label / Eyebrow | IBM Plex Mono | 11-12px | 500 | 1.4 | 0.08em (uppercase) |
| Mono / Data / Reference No | IBM Plex Mono | 12-14px | 500 | 1.4 | 0.02em |
| Table Header | IBM Plex Mono | 11px | 500 | 1.3 | 0.06em (uppercase) |

**Typography Rules:**
- Başlıklar (H1-H3) her zaman Space Grotesk, 600 ağırlığın altına inmez.
- **Etiket niteliğindeki her şey mono'dur**: teklif/sipariş referans numaraları (#123), durum rozetleri (KABUL EDİLDİ / BEKLİYOR), "Yetkili Satıcı"/"GreenBro" rozetleri, tablo başlıkları, borsa kur şeridi (USD/TRY, BTC/USD vb.). Bunlar IBM Plex Mono + uppercase + `letter-spacing: 0.06-0.08em`.
- Gövde metni, form etiketleri, buton yazıları Space Grotesk'te kalır — mono yalnızca "veri/etiket" rolündeki öğelerde.
- **NEVER use**: Fraunces, Source Sans 3, Playfair, Times New Roman (önceki tasarım kalıntıları), sistem serif fontları.

**Text Decoration:**
- Hero H1: gradient veya text-shadow yok — düz `var(--text)` üzerinde net kontrast yeterli (teknik/ölçülü tonla çelişir).
- Mono rozetler/etiketler: arka plan rengi + `border-radius: 4px` (keskin, "damga" hissi) — gradient asla.

## 4. Component Stylings

### Buttons
```css
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  cursor: pointer;
}
.btn:active { transform: scale(0.97); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-primary {
  background: var(--accent);
  color: #FFFFFF;
  border: 1px solid var(--accent);
}
.btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }

.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
```

### Cards
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(var(--text-rgb), 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.card:hover { transform: translateY(-2px); border-color: var(--border-hover); box-shadow: 0 8px 20px rgba(var(--text-rgb), 0.06); }
.card:focus-within { border-color: var(--accent); }
```

### Navigation
```css
.nav {
  background: var(--coffee-dark);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  transition: box-shadow 0.3s ease;
}
.nav.scrolled { box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
```

### Links
```css
.link {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: rgba(var(--accent-rgb), 0.4);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s ease;
}
.link:hover { text-decoration-color: var(--accent); }
```

### Tags / Badges (mono)
```css
.badge {
  font-family: var(--font-mono);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background: rgba(var(--accent-rgb), 0.12);
  color: var(--accent-hover);
}
.badge-verified { background: var(--success-bg); color: var(--success); }
```

### Reference Number (teklif/sipariş no)
```css
.ref-no {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--accent);
}
```

### Data Tables
```css
.data-table thead {
  background: var(--coffee-dark);
  color: #FFFFFF;
}
.data-table th {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.75rem 1rem;
  text-align: left;
}
.data-table td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.data-table tr:hover td { background: var(--surface-alt); }
```

### Inputs
```css
.input {
  font-family: var(--font-body);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 14px;
  transition: border-color 0.15s ease;
}
.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.12); }
```

## 5. Layout Principles

**Container:**
- Max width: 1152px (data/tablo sayfaları — İlanlar, Panel), 960px (metin ağırlıklı — ürün detay)
- Padding: 24px (mobil), 24-32px (masaüstü)

**Spacing Scale:**
- Section padding (dikey): 48-64px (anasayfa section'ları arası)
- Component gap: 16-24px
- Card internal padding: 24px

**Grid:**
```css
.grid-responsive { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | Gölge yok, sadece `--border` | Tablo satırları, input'lar |
| Subtle | `0 1px 2px rgba(text,0.03)` | Kartlar (default) |
| Elevated | `0 8px 20px rgba(text,0.06)` | Kart hover, açık dropdown |
| Modal | `0 20px 48px rgba(text,0.18)` | DetailModal, açılır menüler |

## 7. Animation & Interaction

**Motion Philosophy**: Bilgiyi geciktirmeyen, sadece düzenleyen hareket — scroll-reveal içerik akışını "sahneler" halinde sunar, ama tablo/form sayfalarında asla dikkat dağıtmaz.
**Tier**: L2

### Base Setup (React hook, GSAP gerekmez)
```jsx
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("in-view"); obs.unobserve(el); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
```

### Entrance Animation
```css
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.reveal.in-view { opacity: 1; transform: translateY(0); }
.reveal.in-view > *:nth-child(1) { transition-delay: 0s; }
.reveal.in-view > *:nth-child(2) { transition-delay: 0.08s; }
.reveal.in-view > *:nth-child(3) { transition-delay: 0.16s; }
.reveal.in-view > *:nth-child(4) { transition-delay: 0.24s; }
```

### Scroll Behavior — Nav
```jsx
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

### Hover & Focus States
- Her tıklanabilir öğe: `.card` translateY(-2px), `.btn` arka plan koyulaşması, `.link` alt çizgi rengi koyulaşması.
- Tüm interaktif öğelerde `:focus-visible` halkası zorunlu (yukarıdaki Button/Input tanımlarına bakın).

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal { opacity: 1; transform: none; }
}
```

## 8. Do's and Don'ts

### Do
- Referans numaraları (#123), durum rozetleri, tablo başlıkları her zaman IBM Plex Mono + uppercase + tracking.
- Tek vurgu rengi (`--accent`) — tüm CTA/link/aktif-durum bunu kullanır.
- Kartlarda ölçülü hover (translateY(-2px) + hafif gölge), abartılı değil.
- Panel/tablo sayfalarında animasyon minimal tutulur — L2 girişler yalnızca anasayfa gibi "vitrin" sayfalarında.
- Tüm renkler CSS değişkeni üzerinden.

### Don't
- ❌ İki farklı vurgu rengi aynı section'da kullanılmaz.
- ❌ Gradient text veya text-shadow yasak (teknik/ölçülü ton ile çelişir).
- ❌ Eski Fraunces/Source Sans 3/serif fontlarına dönülmez.
- ❌ Mono font gövde metninde kullanılmaz — yalnızca etiket/veri/rozet rolünde.
- ❌ `backdrop-filter: blur()` büyük alanlarda kullanılmaz (yalnızca dropdown/modal arka planında, ≤12px).
- ❌ Panel/tablo sayfalarına scroll-reveal veya parallax eklenmez (dikkat dağıtır, veri işine odaklanmayı bozar).
- ❌ Köşe yarıçapı 20px+ kullanılmaz (eski "organik" tondan kalıntı) — 8-12px aralığında kalınır.
- ❌ Yeni dekoratif ikon/emoji seti eklenmez; mevcut minimal ikon dilinden sapılmaz.

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | Çok kolonlu grid, panel sidebar dikey |
| Tablet | 640-1024px | 2 kolonlu grid |
| Mobile | < 640px | Tek kolon, panel sidebar yatay kaydırılabilir şerit, tablolar `overflow-x-auto` içinde |

**Touch Targets:** minimum 44×44px (buton, sekme, tablo aksiyon linkleri)
**Collapsing Strategy:** Panel sidebar `flex-col` → `sm:flex-row`; nav'da firma adı mobilde `truncate max-w-[32vw]`; tablo sütunları mobilde yatay kaydırma (`overflow-x-auto`), sayfa asla yatayda taşmaz.
