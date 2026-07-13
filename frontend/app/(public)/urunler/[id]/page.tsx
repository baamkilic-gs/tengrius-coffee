"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getUser, getOrganization } from "../../../../lib/api";

interface ProductDetail {
  id: string;
  title: string;
  country: string;
  region: string | null;
  bean_type: string;
  harvest_year: number | null;
  processing_method: string | null;
  moisture_pct: number | null;
  cupping_notes: string | null;
  pricing_unit: string;
  price_per_unit: number;
  currency: string;
  quantity_available: number;
  seller: { id: string; name: string; country: string | null; verified: boolean };
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");

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
    const res = await api("/offers", {
      method: "POST",
      body: JSON.stringify({
        product_id: params.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQty),
      }),
    });
    if (res.ok) {
      setMessage("Teklifiniz gönderildi");
      setOfferPrice("");
      setOfferQty("");
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
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">{product.title}</h1>
        <p className="text-[var(--text-secondary)]">
          {product.country}
          {product.region ? ` · ${product.region}` : ""} · {product.bean_type}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5">
        <div>Fiyat</div>
        <div className="font-semibold">
          {product.price_per_unit} {product.currency} /{" "}
          {product.pricing_unit === "CONTAINER" ? "konteyner" : "çuval"}
        </div>
        <div>Stok</div>
        <div>{product.quantity_available}</div>
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
        <div>Satıcı</div>
        <div>
          {product.seller.name} {product.seller.verified ? "✓" : ""}
        </div>
      </div>

      {product.cupping_notes && (
        <div>
          <h2 className="font-semibold mb-1">Cupping Notları</h2>
          <p className="text-[var(--text-secondary)] text-sm">{product.cupping_notes}</p>
        </div>
      )}

      {message && <p className="text-sm text-[var(--color-coffee)]">{message}</p>}

      {!user && (
        <p className="text-sm text-[var(--text-secondary)]">
          Teklif vermek veya satın almak için <a href="/giris" className="link">giriş yapın</a>.
        </p>
      )}

      {user && !isPremium && !isOwnProduct && (
        <p className="text-sm text-[var(--text-secondary)]">
          Teklif verme ve satın alma yalnızca Premium üyelere açıktır.{" "}
          <a href="/panel/uyelik" className="link">Üyeliğinizi yükseltin</a>.
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
              step="0.01"
              placeholder="Teklif fiyatı"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              required
              className="input flex-1"
            />
            <input
              type="number"
              placeholder="Miktar"
              value={offerQty}
              onChange={(e) => setOfferQty(e.target.value)}
              required
              className="input flex-1"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">
              Teklif Gönder
            </button>
            <button
              type="button"
              onClick={() => router.push(`/panel/siparislerim?buy=${product.id}`)}
              className="btn btn-primary"
            >
              Satın Al
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
