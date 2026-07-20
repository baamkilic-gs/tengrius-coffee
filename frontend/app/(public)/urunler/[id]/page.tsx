"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getUser, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import FlagIcon from "../../../components/FlagIcon";
import { useToast } from "../../../components/Toast";
import DetailModal from "../../../components/DetailModal";

const PRICE_STEP = 0.05;

interface ProductDetail {
  id: string;
  title: string;
  country: string;
  region: string | null;
  bean_type: string;
  harvest_year: number | null;
  processing_method: string | null;
  moisture_pct: number | null;
  description: string | null;
  cupping_notes: string | null;
  score: number | null;
  greenbro_supplied: boolean;
  price_per_kg: number;
  price_per_ton: number;
  price_per_container: number | null;
  currency: string;
  quantity_tons: number;
  containerType: { name: string } | null;
  seller: { id: string; name: string; country: string | null; verified: boolean };
}

interface MyOffer {
  id: string;
  offer_no: number;
  offer_price: number;
  quantity_kg: number;
  status: string;
  product: { id: string };
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQtyKg, setOfferQtyKg] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const user = getUser();
  const org = getOrganization();
  const isPremium = org?.membership_tier === "PREMIUM";
  const isOwnProduct = org && product && org.id === product.seller.id;

  useEffect(() => {
    api(`/products/${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const loadMyOffers = () => {
    if (!user) return;
    api("/offers/sent")
      .then((res) => res.json())
      .then((data: MyOffer[]) => setMyOffers(Array.isArray(data) ? data.filter((o) => o.product.id === params.id) : []))
      .catch(() => setMyOffers([]));
  };

  useEffect(loadMyOffers, [params.id, user?.id]);

  const openOfferModal = () => {
    setOfferPrice(product ? String(product.price_per_kg) : "");
    setOfferQtyKg("");
    setOfferModalOpen(true);
  };

  const adjustPrice = (delta: number) => {
    setOfferPrice((prev) => {
      const current = Number(prev) || 0;
      const next = Math.max(0, Math.round((current + delta) * 100) / 100);
      return String(next);
    });
  };

  const sendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOffer(true);
    const res = await api("/offers", {
      method: "POST",
      body: JSON.stringify({
        product_id: params.id,
        offer_price: Number(offerPrice),
        quantity_kg: Number(offerQtyKg),
      }),
    });
    setSendingOffer(false);
    if (res.ok) {
      const created = await res.json();
      showToast("Teklifiniz gönderildi ✓");
      setOfferModalOpen(false);
      setOfferPrice("");
      setOfferQtyKg("");
      setJustAddedId(created.id);
      loadMyOffers();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.message ?? "Teklif gönderilemedi", "error");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Yükleniyor…</p>;
  if (!product) return <p className="text-center py-10 text-gray-500">{notFound ? "Ürün bulunamadı" : ""}</p>;

  const showOffersBox = Boolean(user && !isOwnProduct);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className={showOffersBox ? "grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8" : ""}>
        <div className="space-y-6 min-w-0">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">
              {product.title}
              {product.greenbro_supplied && (
                <span className="badge ml-2 align-middle" title="GreenBro'ya tedarik ediliyor/uygun">
                  GreenBro
                </span>
              )}
            </h1>
            <p className="text-[var(--text-secondary)]">
              <FlagIcon country={product.country} /> {product.country}
              {product.region ? ` · ${product.region}` : ""} · {product.bean_type}
            </p>
          </div>

          {product.description && <p className="text-sm text-[var(--text-secondary)]">{product.description}</p>}

          <div className="grid grid-cols-2 gap-4 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5">
            <div>Kg Fiyatı</div>
            <div className="font-semibold">
              {formatNumber(product.price_per_kg, 4)} {product.currency}
            </div>
            <div>Ton Fiyatı</div>
            <div className="font-semibold">
              {formatNumber(product.price_per_ton)} {product.currency}
            </div>
            {product.price_per_container != null && (
              <>
                <div>Konteyner Fiyatı{product.containerType ? ` (${product.containerType.name})` : ""}</div>
                <div className="font-semibold">
                  {formatNumber(product.price_per_container)} {product.currency}
                </div>
              </>
            )}
            <div>Stok</div>
            <div>{formatNumber(product.quantity_tons, 1)} ton</div>
            {product.harvest_year && (
              <>
                <div>Hasat Yılı</div>
                <div>{product.harvest_year}</div>
              </>
            )}
            {product.processing_method && (
              <>
                <div>İşleme Yöntemi</div>
                <div>{product.processing_method}</div>
              </>
            )}
            {product.moisture_pct != null && (
              <>
                <div>Nem Oranı</div>
                <div>%{product.moisture_pct}</div>
              </>
            )}
            {product.score != null && (
              <>
                <div>Skor</div>
                <div>{product.score}</div>
              </>
            )}
            <div>Satıcı</div>
            <div>
              {product.seller.name} {product.seller.verified ? "✓" : ""}
            </div>
          </div>

          {product.cupping_notes && (
            <div>
              <h2 className="font-semibold mb-1">Tadım Notları</h2>
              <p className="text-[var(--text-secondary)] text-sm">{product.cupping_notes}</p>
            </div>
          )}

          {!user && (
            <p className="text-sm text-[var(--text-secondary)]">
              Teklif vermek için <a href="/giris" className="link">giriş yapın</a>.
            </p>
          )}

          {user && !isPremium && !isOwnProduct && (
            <p className="text-sm text-[var(--text-secondary)]">
              Teklif verme yalnızca Premium üyelere açıktır.{" "}
              <a href="/panel/uyelik" className="link">Üyeliğinizi yükseltin</a>.
            </p>
          )}

          {user && isOwnProduct && (
            <p className="text-sm text-[var(--text-tertiary)]">
              Bu ürün size ait olduğu için teklif verme seçeneği gösterilmiyor. Başka bir organizasyonun
              ürününü görüntülediğinizde bu bölümde "Teklif Ver" formu çıkar.
            </p>
          )}

          {user && isPremium && !isOwnProduct && (
            <button onClick={openOfferModal} className="btn btn-primary">
              Teklif Ver
            </button>
          )}
        </div>

        {showOffersBox && (
          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="card !p-4">
              <h2 className="font-semibold text-sm mb-3">Bu Ürün İçin Tekliflerim</h2>
              {myOffers.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">Henüz teklif vermediniz.</p>
              ) : (
                <div className="space-y-2">
                  {myOffers.map((o) => (
                    <div
                      key={o.id}
                      className={`text-xs rounded-lg p-2.5 border transition-colors ${
                        o.id === justAddedId
                          ? "border-[var(--success)] bg-[var(--success-bg)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="ref-no">#{o.offer_no}</span>
                        {o.id === justAddedId && (
                          <span className="badge badge-verified !text-[9px]">Yeni</span>
                        )}
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1">
                        {formatNumber(o.offer_price, 4)} USD/kg × {formatNumber(o.quantity_kg, 0)} kg
                      </p>
                      <p className="mt-0.5 font-medium">{STATUS_LABEL[o.status] ?? o.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {offerModalOpen && (
        <DetailModal title="Teklif Ver" onClose={() => setOfferModalOpen(false)}>
          <form onSubmit={sendOffer} className="space-y-3">
            <div>
              <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">
                Teklif fiyatı (kg başına, {product.currency})
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => adjustPrice(-PRICE_STEP)}
                  aria-label="Fiyatı azalt"
                  className="w-9 h-9 shrink-0 rounded-full border border-[var(--border)] text-lg leading-none flex items-center justify-center hover:bg-[var(--surface-hover)] hover:border-[var(--color-gold)] transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Teklif fiyatı"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  className="input flex-1 text-center"
                />
                <button
                  type="button"
                  onClick={() => adjustPrice(PRICE_STEP)}
                  aria-label="Fiyatı artır"
                  className="w-9 h-9 shrink-0 rounded-full border border-[var(--border)] text-lg leading-none flex items-center justify-center hover:bg-[var(--surface-hover)] hover:border-[var(--color-gold)] transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                İlan fiyatı {formatNumber(product.price_per_kg, 4)} {product.currency}/kg olarak otomatik dolduruldu.
                +/- ile ayarlayın ya da elle yazın.
              </p>
            </div>

            <div>
              <label className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">Miktar (kg)</label>
              <input
                type="number"
                placeholder="Miktar (kg)"
                value={offerQtyKg}
                onChange={(e) => setOfferQtyKg(e.target.value)}
                required
                className="input w-full mt-1"
              />
              {offerQtyKg && Number(offerQtyKg) > 0 && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  ≈ {formatNumber(Number(offerQtyKg) / 1000, 3)} ton
                </p>
              )}
            </div>

            <button type="submit" disabled={sendingOffer} className="btn btn-primary w-full">
              {sendingOffer ? "Gönderiliyor…" : "Teklif Gönder"}
            </button>
          </form>
        </DetailModal>
      )}

      {sendingOffer && (
        <div className="wait-overlay fixed inset-0 z-[110] flex items-center justify-center">
          <div className="bg-[var(--surface)] rounded-[14px] shadow-2xl px-6 py-4 flex items-center gap-3">
            <span className="spinner" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Lütfen bekleyiniz…</span>
          </div>
        </div>
      )}
    </div>
  );
}
