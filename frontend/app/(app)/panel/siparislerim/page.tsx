"use client";

import { useEffect, useState } from "react";
import { api, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import DetailModal from "../../../components/DetailModal";

interface OrgInfo {
  id: string;
  name: string;
  company_legal_name: string | null;
  tax_number: string | null;
  tax_office: string | null;
  website: string | null;
  country: string | null;
  verified: boolean;
  bank_iban_try: string | null;
  bank_iban_usd: string | null;
  shipping_address: string | null;
}

interface Order {
  id: string;
  order_no: number;
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  buyer_org_id: string;
  seller_org_id: string;
  created_at: string;
  product: { id: string; title: string };
  buyer: OrgInfo;
  seller: OrgInfo;
  offer: { id: string; offer_no: number } | null;
}

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  CREATED: "Oluşturuldu",
  CONFIRMED: "Onaylandı",
  SHIPPED: "Sevk Edildi",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal Edildi",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Order | null>(null);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());
  const org = getOrganization();

  const load = () => {
    api("/orders/mine")
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmPayment = async (id: string) => {
    await api(`/orders/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status: "PAID" }),
    });
    load();
    setDetail(null);
  };

  const notifyBankTransfer = async (id: string) => {
    await api(`/payments/bank-transfer/${id}/notify`, { method: "POST" });
    setNotifiedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Siparişlerim</h1>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : orders.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">
          Henüz siparişiniz yok — bir teklif kabul edildiğinde sipariş burada otomatik olarak görünür.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm border-collapse data-table">
            <thead>
              <tr>
                <th className="py-2.5 px-4 font-medium">Sipariş No</th>
                <th className="py-2.5 px-4 font-medium">Teklif No</th>
                <th className="py-2.5 px-4 font-medium">Ürün</th>
                <th className="py-2.5 px-4 font-medium">Miktar</th>
                <th className="py-2.5 px-4 font-medium">Toplam</th>
                <th className="py-2.5 px-4 font-medium">Ödeme</th>
                <th className="py-2.5 px-4 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                  <td className="py-2 px-4">
                    <button onClick={() => setDetail(o)} className="link ref-no">
                      #{o.order_no}
                    </button>
                  </td>
                  <td className="py-2 px-4 ref-no">{o.offer ? `#${o.offer.offer_no}` : "—"}</td>
                  <td className="py-2 px-4">{o.product.title}</td>
                  <td className="py-2 px-4">{formatNumber(o.quantity_kg / 1000, 1)} ton</td>
                  <td className="py-2 px-4 font-semibold text-[var(--color-coffee)]">
                    {formatNumber(o.total_amount)} {o.currency}
                  </td>
                  <td className="py-2 px-4">{PAYMENT_LABEL[o.payment_status] ?? o.payment_status}</td>
                  <td className="py-2 px-4">{ORDER_STATUS_LABEL[o.order_status] ?? o.order_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail &&
        (() => {
          const isBuyer = org?.id === detail.buyer_org_id;
          const counterpart = isBuyer ? detail.seller : detail.buyer;
          return (
            <DetailModal title={`Sipariş #${detail.order_no}`} onClose={() => setDetail(null)}>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-[var(--text-tertiary)]">Ürün</div>
                  <div>{detail.product.title}</div>
                  {detail.offer && (
                    <>
                      <div className="text-[var(--text-tertiary)]">Teklif No</div>
                      <div className="ref-no">#{detail.offer.offer_no}</div>
                    </>
                  )}
                  <div className="text-[var(--text-tertiary)]">Miktar</div>
                  <div>
                    {formatNumber(detail.quantity_kg / 1000, 1)} ton × {formatNumber(detail.unit_price, 4)} {detail.currency}
                  </div>
                  <div className="text-[var(--text-tertiary)]">Toplam</div>
                  <div className="font-semibold text-[var(--color-coffee)]">
                    {formatNumber(detail.total_amount)} {detail.currency}
                  </div>
                  <div className="text-[var(--text-tertiary)]">Ödeme Durumu</div>
                  <div>{PAYMENT_LABEL[detail.payment_status] ?? detail.payment_status}</div>
                  <div className="text-[var(--text-tertiary)]">Sipariş Durumu</div>
                  <div>{ORDER_STATUS_LABEL[detail.order_status] ?? detail.order_status}</div>
                  <div className="text-[var(--text-tertiary)]">Tarih</div>
                  <div>{new Date(detail.created_at).toLocaleString("tr-TR")}</div>
                </div>

                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold mb-2">
                    {isBuyer ? "Satıcı" : "Alıcı"} Firma Bilgileri
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <div>Firma</div>
                    <div>
                      {counterpart.name}{" "}
                      {counterpart.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
                    </div>
                    {counterpart.company_legal_name && (
                      <>
                        <div>Şirket Adı</div>
                        <div>{counterpart.company_legal_name}</div>
                      </>
                    )}
                    {(counterpart.tax_number || counterpart.tax_office) && (
                      <>
                        <div>Vergi No / Dairesi</div>
                        <div>
                          {counterpart.tax_number ?? "—"} / {counterpart.tax_office ?? "—"}
                        </div>
                      </>
                    )}
                    {counterpart.website && (
                      <>
                        <div>Website</div>
                        <div>{counterpart.website}</div>
                      </>
                    )}
                    {counterpart.country && (
                      <>
                        <div>Ülke</div>
                        <div>{counterpart.country}</div>
                      </>
                    )}
                    {!isBuyer && counterpart.shipping_address && (
                      <>
                        <div>Sevk Adresi</div>
                        <div>{counterpart.shipping_address}</div>
                      </>
                    )}
                    {isBuyer && (counterpart.bank_iban_try || counterpart.bank_iban_usd) && (
                      <>
                        {counterpart.bank_iban_try && (
                          <>
                            <div>TL IBAN</div>
                            <div>{counterpart.bank_iban_try}</div>
                          </>
                        )}
                        {counterpart.bank_iban_usd && (
                          <>
                            <div>USD IBAN</div>
                            <div>{counterpart.bank_iban_usd}</div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isBuyer && detail.payment_status === "PENDING" && (
                  <div className="border-t border-[var(--border)] pt-3">
                    {notifiedIds.has(detail.id) ? (
                      <span className="text-xs text-[var(--success)]">Bildirildi ✓ — satıcı dekontunuzu bekliyor</span>
                    ) : (
                      <button onClick={() => notifyBankTransfer(detail.id)} className="btn btn-primary !py-1.5 !px-3 !text-xs">
                        Havale Yaptım — Bildir
                      </button>
                    )}
                  </div>
                )}

                {org?.id === detail.seller_org_id && detail.payment_status === "PENDING" && (
                  <div className="border-t border-[var(--border)] pt-3">
                    <button onClick={() => confirmPayment(detail.id)} className="btn btn-primary !py-1.5 !px-3 !text-xs">
                      Ödemeyi Onayla
                    </button>
                  </div>
                )}
              </div>
            </DetailModal>
          );
        })()}
    </div>
  );
}
