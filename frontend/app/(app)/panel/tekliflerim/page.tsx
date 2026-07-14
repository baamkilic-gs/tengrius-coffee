"use client";

import { useEffect, useState } from "react";
import { api, getOrganization } from "../../../../lib/api";

interface Offer {
  id: string;
  offer_price: number;
  quantity_kg: number;
  status: string;
  message: string | null;
  product: { id: string; title: string };
  buyer?: { id: string; name: string; verified: boolean };
}

export default function MyOffersPage() {
  const [sent, setSent] = useState<Offer[]>([]);
  const [received, setReceived] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const org = getOrganization();
  const canSell = !["BUYER", "ROASTER"].includes(org?.type ?? "");

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

  if (loading) return <p className="text-[var(--text-secondary)]">Yükleniyor…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Tekliflerim</h1>

      {received.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Gelen Teklifler</h2>
          {received.map((o) => (
            <div key={o.id} className="card flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{o.product.title}</p>
                <p className="text-[var(--text-secondary)]">
                  {o.buyer?.name} — {o.offer_price} USD/kg × {o.quantity_kg} kg — {o.status}
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
        {sent.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm">Henüz teklif vermediniz</p>
        ) : (
          sent.map((o) => (
            <div key={o.id} className="card text-sm">
              <p className="font-medium">{o.product.title}</p>
              <p className="text-[var(--text-secondary)]">
                {o.offer_price} USD/kg × {o.quantity_kg} kg — {o.status}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
