"use client";

import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { api, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";

interface Offer {
  id: string;
  offer_price: number;
  quantity_kg: number;
  status: string;
  order_id: string | null;
  message: string | null;
  product: { id: string; title: string };
  buyer?: { id: string; name: string; verified: boolean };
}

const STATUS_STYLE: Record<string, string> = {
  ACCEPTED: "border-l-4 border-l-[var(--success)]",
  REJECTED: "border-l-4 border-l-[var(--error)] opacity-70",
  PENDING: "",
};

function groupByStatus(offers: Offer[]) {
  return {
    accepted: offers.filter((o) => o.status === "ACCEPTED"),
    pending: offers.filter((o) => o.status === "PENDING"),
    rejected: offers.filter((o) => o.status === "REJECTED"),
  };
}

export default function MyOffersPage() {
  const [sent, setSent] = useState<Offer[]>([]);
  const [received, setReceived] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingOrderFor, setCreatingOrderFor] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const org = getOrganization();
  const canSell = org?.type === "SELLER";

  const load = () => {
    Promise.all([
      api("/offers/sent").then((r) => r.json()),
      canSell ? api("/offers/received").then((r) => r.json()) : Promise.resolve([]),
    ])
      .then(([sentData, receivedData]) => {
        setSent(sentData);
        setReceived(receivedData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resolve = async (id: string, action: "accept" | "reject") => {
    await api(`/offers/${id}/${action}`, { method: "PATCH" });
    load();
  };

  const createOrderFromOffer = async (offerId: string) => {
    setOrderError(null);
    setCreatingOrderFor(offerId);
    const res = await api("/orders", {
      method: "POST",
      body: JSON.stringify({ offer_id: offerId, payment_method: "BANK_TRANSFER" }),
    });
    if (res.ok) {
      const order = await res.json();
      await api(`/payments/bank-transfer/${order.id}/notify`, { method: "POST" });
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setOrderError(err.message ?? "Sipariş oluşturulamadı");
    }
    setCreatingOrderFor(null);
  };

  if (loading) return <p className="text-[var(--text-secondary)]">Yükleniyor…</p>;

  const receivedGroups = groupByStatus(received);
  const sentGroups = groupByStatus(sent);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Tekliflerim</h1>

      {received.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Gelen Teklifler</h2>
          {[...receivedGroups.accepted, ...receivedGroups.pending, ...receivedGroups.rejected].map((o) => (
            <div key={o.id} className={`card flex items-center justify-between text-sm ${STATUS_STYLE[o.status]}`}>
              <div>
                <p className="font-medium">{o.product.title}</p>
                <p className="text-[var(--text-secondary)]">
                  {o.buyer?.name} — {formatNumber(o.offer_price, 4)} USD/kg × {formatNumber(o.quantity_kg, 0)} kg —{" "}
                  {o.status}
                </p>
              </div>
              {o.status === "PENDING" && (
                <div className="flex gap-2">
                  <button onClick={() => resolve(o.id, "accept")} className="btn btn-primary !py-1 !px-3 !text-xs">
                    Kabul Et
                  </button>
                  <button
                    onClick={() => resolve(o.id, "reject")}
                    className="border border-[var(--border)] px-3 py-1 rounded-full text-xs hover:border-[var(--color-gold)] transition-colors"
                  >
                    Reddet
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Verdiğim Teklifler</h2>
        {orderError && <p className="text-sm text-[var(--error)]">{orderError}</p>}
        {sent.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm">
            Henüz teklif vermediniz — teklif vermek için bir{" "}
            <Link href="/urunler" className="link">
              ürün sayfasına
            </Link>{" "}
            gidip "Teklif Ver" formunu kullanın (Premium üyelik gerekir).
          </p>
        ) : (
          [...sentGroups.accepted, ...sentGroups.pending, ...sentGroups.rejected].map((o) => (
            <div key={o.id} className={`card flex items-center justify-between text-sm ${STATUS_STYLE[o.status]}`}>
              <div>
                <p className="font-medium">{o.product.title}</p>
                <p className="text-[var(--text-secondary)]">
                  {formatNumber(o.offer_price, 4)} USD/kg × {formatNumber(o.quantity_kg, 0)} kg — {o.status}
                </p>
              </div>
              {o.status === "ACCEPTED" && !o.order_id && (
                <button
                  onClick={() => createOrderFromOffer(o.id)}
                  disabled={creatingOrderFor === o.id}
                  className="btn btn-primary !py-1 !px-3 !text-xs"
                >
                  {creatingOrderFor === o.id ? "Oluşturuluyor…" : "Bu Tekliften Sipariş Oluştur"}
                </button>
              )}
              {o.order_id && (
                <Link href="/panel/siparislerim" className="link text-xs">
                  Sipariş oluşturuldu ✓
                </Link>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
