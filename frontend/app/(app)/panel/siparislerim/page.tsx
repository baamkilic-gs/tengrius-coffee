"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, getOrganization } from "../../../../lib/api";

interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  buyer_org_id: string;
  seller_org_id: string;
  product: { id: string; title: string };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyForm, setBuyForm] = useState({ quantity: "", unit_price: "" });
  const [buyError, setBuyError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const buyProductId = searchParams.get("buy");
  const org = getOrganization();

  const load = () => {
    api("/orders/mine")
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyError(null);
    const res = await api("/orders", {
      method: "POST",
      body: JSON.stringify({
        product_id: buyProductId,
        quantity: Number(buyForm.quantity),
        unit_price: buyForm.unit_price ? Number(buyForm.unit_price) : undefined,
        payment_method: "BANK_TRANSFER",
      }),
    });
    if (res.ok) {
      const order = await res.json();
      await api(`/payments/bank-transfer/${order.id}/notify`, { method: "POST" });
      setBuyForm({ quantity: "", unit_price: "" });
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setBuyError(err.message ?? "Sipariş oluşturulamadı");
    }
  };

  const confirmPayment = async (id: string) => {
    await api(`/orders/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ payment_status: "PAID" }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Siparişlerim</h1>

      {buyProductId && (
        <form onSubmit={submitPurchase} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Satın Alma — Banka Havalesi</h2>
          <p className="text-sm text-gray-500">
            Miktarı girin, sipariş oluşturulduktan sonra havale bilgileriyle ödemeyi yapın; satıcı dekontu
            onayladığında sipariş durumu güncellenir.
          </p>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Miktar"
              value={buyForm.quantity}
              onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
              required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Birim fiyat (boş bırakılırsa güncel fiyat)"
              value={buyForm.unit_price}
              onChange={(e) => setBuyForm({ ...buyForm, unit_price: e.target.value })}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1"
            />
          </div>
          {buyError && <p className="text-sm text-red-600">{buyError}</p>}
          <button type="submit" className="bg-[var(--color-gold)] text-[var(--color-coffee-dark)] px-4 py-1.5 rounded text-sm font-medium">
            Siparişi Oluştur
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Yükleniyor…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz siparişiniz yok</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--color-gold)]">
              <th className="py-2">Ürün</th>
              <th className="py-2">Miktar</th>
              <th className="py-2">Tutar</th>
              <th className="py-2">Ödeme</th>
              <th className="py-2">Durum</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100">
                <td className="py-2">{o.product.title}</td>
                <td className="py-2">{o.quantity}</td>
                <td className="py-2">
                  {o.total_amount} {o.currency}
                </td>
                <td className="py-2">{o.payment_status}</td>
                <td className="py-2">{o.order_status}</td>
                <td className="py-2">
                  {org?.id === o.seller_org_id && o.payment_status === "PENDING" && (
                    <button onClick={() => confirmPayment(o.id)} className="text-xs underline">
                      Ödemeyi Onayla
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
