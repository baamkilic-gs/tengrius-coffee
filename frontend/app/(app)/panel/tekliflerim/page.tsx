"use client";

import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { api, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import DetailModal from "../../../components/DetailModal";

interface Offer {
  id: string;
  offer_no: number;
  offer_price: number;
  quantity_kg: number;
  status: string;
  order_id: string | null;
  order: { id: string; order_no: number } | null;
  message: string | null;
  created_at: string;
  product: { id: string; title: string };
  buyer?: { id: string; name: string; verified: boolean };
}

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Kabul Edildi",
  REJECTED: "Reddedildi",
  PENDING: "Bekliyor",
};

const STATUS_CLASS: Record<string, string> = {
  ACCEPTED: "text-[var(--success)] font-medium",
  REJECTED: "text-[var(--error)] font-medium",
  PENDING: "text-[var(--text-secondary)]",
};

function StatusLabel({ status }: { status: string }) {
  return <span className={STATUS_CLASS[status]}>{STATUS_LABEL[status] ?? status}</span>;
}

function groupByStatus(offers: Offer[]) {
  return [
    ...offers.filter((o) => o.status === "ACCEPTED"),
    ...offers.filter((o) => o.status === "PENDING"),
    ...offers.filter((o) => o.status === "REJECTED"),
  ];
}

export default function MyOffersPage() {
  const [sent, setSent] = useState<Offer[]>([]);
  const [received, setReceived] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Offer | null>(null);
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
    setResolveError(null);
    const res = await api(`/offers/${id}/${action}`, { method: "PATCH" });
    if (res.ok) {
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setResolveError(err.message ?? "İşlem gerçekleştirilemedi");
    }
  };

  if (loading) return <p className="text-[var(--text-secondary)]">Yükleniyor…</p>;

  const receivedList = groupByStatus(received);
  const sentList = groupByStatus(sent);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Tekliflerim</h1>
      {resolveError && <p className="text-sm text-[var(--error)]">{resolveError}</p>}

      {received.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Gelen Teklifler</h2>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)] text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-4 font-medium">Teklif No</th>
                  <th className="py-2.5 px-4 font-medium">Ürün</th>
                  <th className="py-2.5 px-4 font-medium">Alıcı</th>
                  <th className="py-2.5 px-4 font-medium">Fiyat</th>
                  <th className="py-2.5 px-4 font-medium">Miktar</th>
                  <th className="py-2.5 px-4 font-medium">Durum</th>
                  <th className="py-2.5 px-4 font-medium">Sipariş No</th>
                  <th className="py-2.5 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {receivedList.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                    <td className="py-2 px-4">
                      <button onClick={() => setDetail(o)} className="link font-medium">
                        #{o.offer_no}
                      </button>
                    </td>
                    <td className="py-2 px-4">{o.product.title}</td>
                    <td className="py-2 px-4">{o.buyer?.name}</td>
                    <td className="py-2 px-4">{formatNumber(o.offer_price, 4)} USD/kg</td>
                    <td className="py-2 px-4">{formatNumber(o.quantity_kg, 0)} kg</td>
                    <td className="py-2 px-4">
                      <StatusLabel status={o.status} />
                    </td>
                    <td className="py-2 px-4">
                      {o.order ? (
                        <Link href="/panel/siparislerim" className="link">
                          #{o.order.order_no}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {o.status === "PENDING" && (
                        <div className="flex gap-2 justify-end">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Verdiğim Teklifler</h2>
        {sent.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm">
            Henüz teklif vermediniz — teklif vermek için bir{" "}
            <Link href="/urunler" className="link">
              ürün sayfasına
            </Link>{" "}
            gidip "Teklif Ver" formunu kullanın (Premium üyelik gerekir).
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)] text-xs uppercase tracking-wide">
                  <th className="py-2.5 px-4 font-medium">Teklif No</th>
                  <th className="py-2.5 px-4 font-medium">Ürün</th>
                  <th className="py-2.5 px-4 font-medium">Fiyat</th>
                  <th className="py-2.5 px-4 font-medium">Miktar</th>
                  <th className="py-2.5 px-4 font-medium">Durum</th>
                  <th className="py-2.5 px-4 font-medium">Sipariş No</th>
                </tr>
              </thead>
              <tbody>
                {sentList.map((o) => (
                  <tr key={o.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                    <td className="py-2 px-4">
                      <button onClick={() => setDetail(o)} className="link font-medium">
                        #{o.offer_no}
                      </button>
                    </td>
                    <td className="py-2 px-4">{o.product.title}</td>
                    <td className="py-2 px-4">{formatNumber(o.offer_price, 4)} USD/kg</td>
                    <td className="py-2 px-4">{formatNumber(o.quantity_kg, 0)} kg</td>
                    <td className="py-2 px-4">
                      <StatusLabel status={o.status} />
                    </td>
                    <td className="py-2 px-4">
                      {o.order ? (
                        <Link href="/panel/siparislerim" className="link">
                          #{o.order.order_no}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detail && (
        <DetailModal title={`Teklif #${detail.offer_no}`} onClose={() => setDetail(null)}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-[var(--text-tertiary)]">Ürün</div>
            <div>{detail.product.title}</div>
            {detail.buyer && (
              <>
                <div className="text-[var(--text-tertiary)]">Alıcı</div>
                <div>{detail.buyer.name}</div>
              </>
            )}
            <div className="text-[var(--text-tertiary)]">Kg Fiyatı</div>
            <div>{formatNumber(detail.offer_price, 4)} USD</div>
            <div className="text-[var(--text-tertiary)]">Miktar</div>
            <div>{formatNumber(detail.quantity_kg, 0)} kg</div>
            <div className="text-[var(--text-tertiary)]">Durum</div>
            <div>
              <StatusLabel status={detail.status} />
            </div>
            {detail.order && (
              <>
                <div className="text-[var(--text-tertiary)]">Sipariş No</div>
                <div>
                  <Link href="/panel/siparislerim" className="link">
                    #{detail.order.order_no}
                  </Link>
                </div>
              </>
            )}
            <div className="text-[var(--text-tertiary)]">Tarih</div>
            <div>{new Date(detail.created_at).toLocaleString("tr-TR")}</div>
            {detail.message && (
              <>
                <div className="text-[var(--text-tertiary)]">Mesaj</div>
                <div>{detail.message}</div>
              </>
            )}
          </div>
        </DetailModal>
      )}
    </div>
  );
}
