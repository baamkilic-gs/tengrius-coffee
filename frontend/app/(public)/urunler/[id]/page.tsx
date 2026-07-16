"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getUser, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import { flagFor } from "../../../../lib/countryFlags";

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

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQtyKg, setOfferQtyKg] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);

  const user = getUser();
  const org = getOrganization();
  const isPremium = org?.membership_tier === "PREMIUM";
  const isOwnProduct = org && product && org.id === product.seller.id;

  useEffect(() => {
    api(`/products/${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setProduct)
      .catch(() => setMessage("Ürün bulunamadı"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const sendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
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
      setMessage("Teklifiniz gönderildi");
      setOfferPrice("");
      setOfferQtyKg("");
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(err.message ?? "Teklif gönderilemedi");
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Yükleniyor…</p>;
  if (!product) return <p className="text-center py-10 text-gray-500">{message ?? "Ürün bulunamadı"}</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
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
          {flagFor(product.country)} {product.country}
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

      {message && <p className="text-sm text-[var(--color-coffee)]">{message}</p>}

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
          Bu ürün size ait olduğu için teklif verme seçeneği gösterilmiyor — başka bir organizasyonun
          ürününü görüntülediğinizde bu bölümde "Teklif Ver" formu çıkar.
        </p>
      )}

      {user && isPremium && !isOwnProduct && (
        <form
          onSubmit={sendOffer}
          className="space-y-3 bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5"
        >
          <h2 className="font-semibold">Teklif Ver</h2>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.0001"
              placeholder="Teklif fiyatı (kg başına)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              required
              className="input flex-1"
            />
            <div className="flex-1">
              <input
                type="number"
                placeholder="Miktar (kg)"
                value={offerQtyKg}
                onChange={(e) => setOfferQtyKg(e.target.value)}
                required
                className="input w-full"
              />
              {offerQtyKg && Number(offerQtyKg) > 0 && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  ≈ {formatNumber(Number(offerQtyKg) / 1000, 3)} ton
                </p>
              )}
            </div>
          </div>
          <button type="submit" disabled={sendingOffer} className="btn btn-primary">
            {sendingOffer ? "Gönderiliyor…" : "Teklif Gönder"}
          </button>
        </form>
      )}
    </div>
  );
}
