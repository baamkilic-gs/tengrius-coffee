"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getOrganization } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";

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
  quantity_kg: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  buyer_org_id: string;
  seller_org_id: string;
  product: { id: string; title: string };
  buyer: OrgInfo;
  seller: OrgInfo;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
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
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Siparişlerim</h1>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : orders.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">
          Henüz siparişiniz yok — bir teklif kabul edildikten sonra{" "}
          <Link href="/panel/tekliflerim" className="link">
            Tekliflerim
          </Link>{" "}
          sayfasından sipariş oluşturabilirsiniz.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isBuyer = org?.id === o.buyer_org_id;
            const counterpart = isBuyer ? o.seller : o.buyer;
            const isExpanded = expanded === o.id;
            return (
              <div key={o.id} className="card space-y-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{o.product.title}</p>
                    <p className="text-[var(--text-secondary)]">
                      {formatNumber(o.quantity_kg / 1000, 1)} ton × {formatNumber(o.unit_price, 4)} {o.currency} ={" "}
                      {formatNumber(o.total_amount)} {o.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      Ödeme: <span className="font-medium">{o.payment_status}</span>
                    </p>
                    <p>
                      Durum: <span className="font-medium">{o.order_status}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : o.id)}
                  className="link text-xs"
                >
                  {isExpanded ? "Firma bilgilerini gizle" : `${isBuyer ? "Satıcı" : "Alıcı"} firma bilgilerini göster`}
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--border)] pt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <div>Firma</div>
                    <div>
                      {counterpart.name} {counterpart.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
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
                )}

                {org?.id === o.seller_org_id && o.payment_status === "PENDING" && (
                  <button onClick={() => confirmPayment(o.id)} className="link text-xs">
                    Ödemeyi Onayla
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
