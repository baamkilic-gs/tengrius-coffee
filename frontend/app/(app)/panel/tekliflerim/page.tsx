"use client";

import { useEffect, useState } from "react";
import { api, getOrganization } from "../../../../lib/api";

interface Offer {
  id: string;
  offer_price: number;
  quantity: number;
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

  const load = () => {
    Promise.all([
      api("/offers/sent").then((r) => r.json()),
      org?.type !== "BUYER" ? api("/offers/received").then((r) => r.json()) : Promise.resolve([]),
    ])
      .then(([sentData, receivedData]) => {
        setSent(sentData);
        setReceived(receivedData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const resolve = async (id: string, action: "accept" | "reject") => {
    await api(`/offers/${id}/${action}`, { method: "PATCH" });
    load();
  };

  if (loading) return <p className="text-gray-500">Yükleniyor…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Tekliflerim</h1>

      {received.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Gelen Teklifler</h2>
          {received.map((o) => (
            <div key={o.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{o.product.title}</p>
                <p className="text-gray-500">
                  {o.buyer?.name} — {o.offer_price} USD × {o.quantity} — {o.status}
                </p>
              </div>
              {o.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolve(o.id, "accept")}
                    className="bg-[var(--color-coffee)] text-white px-3 py-1 rounded text-xs"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => resolve(o.id, "reject")}
                    className="border border-gray-300 px-3 py-1 rounded text-xs"
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
          <p className="text-gray-500 text-sm">Henüz teklif vermediniz</p>
        ) : (
          sent.map((o) => (
            <div key={o.id} className="border border-gray-200 rounded-lg p-3 text-sm">
              <p className="font-medium">{o.product.title}</p>
              <p className="text-gray-500">
                {o.offer_price} USD × {o.quantity} — {o.status}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
