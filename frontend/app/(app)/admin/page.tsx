"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";

interface ContainerType {
  id: string;
  name: string;
  capacity_kg: number;
  bag_count: number | null;
  bag_weight_kg: number | null;
  is_active: boolean;
}

interface Org {
  id: string;
  name: string;
  type: "SELLER" | "ROASTER";
  country: string | null;
  verified: boolean;
  membership_tier: "STANDARD" | "BASIC" | "PREMIUM";
}

const TIER_LABEL: Record<string, string> = {
  STANDARD: "Standart",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

interface MembershipRequest {
  id: string;
  requested_tier: "BASIC" | "PREMIUM";
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  organization: { id: string; name: string; type: "SELLER" | "ROASTER"; membership_tier: string };
}

const REQUEST_STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

const emptyForm = { name: "", capacity_kg: "", bag_count: "", bag_weight_kg: "" };

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const loadContainerTypes = () => {
    api("/container-types")
      .then((res) => res.json())
      .then(setContainerTypes)
      .catch(() => setContainerTypes([]));
  };

  const loadOrgs = () => {
    api("/organizations")
      .then((res) => res.json())
      .then(setOrgs)
      .catch(() => setOrgs([]));
  };

  const toggleVerified = async (s: Org) => {
    await api(`/organizations/${s.id}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verified: !s.verified }),
    });
    loadOrgs();
  };

  const setMembership = async (o: Org, tier: string) => {
    await api(`/organizations/${o.id}/membership`, {
      method: "PATCH",
      body: JSON.stringify({ tier }),
    });
    loadOrgs();
  };

  const loadMembershipRequests = () => {
    api("/organizations/membership-requests")
      .then((res) => res.json())
      .then(setMembershipRequests)
      .catch(() => setMembershipRequests([]));
  };

  const decideMembershipRequest = async (r: MembershipRequest, decision: "APPROVED" | "REJECTED") => {
    await api(`/organizations/membership-requests/${r.id}`, {
      method: "PATCH",
      body: JSON.stringify({ decision }),
    });
    loadMembershipRequests();
    loadOrgs();
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/giris");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/panel");
      return;
    }
    setReady(true);
    loadContainerTypes();
    loadOrgs();
    loadMembershipRequests();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    const res = await api("/container-types", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        capacity_kg: Number(form.capacity_kg),
        bag_count: form.bag_count ? Number(form.bag_count) : undefined,
        bag_weight_kg: form.bag_weight_kg ? Number(form.bag_weight_kg) : undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setForm(emptyForm);
      setSuccess("Konteyner tipi eklendi.");
      loadContainerTypes();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Konteyner tipi eklenemedi");
    }
  };

  const toggleActive = async (ct: ContainerType) => {
    await api(`/container-types/${ct.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !ct.is_active }),
    });
    loadContainerTypes();
  };

  if (!ready) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Admin Panel</h1>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Konteyner Tipleri</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Ürün fiyatlarındaki kg→ton/konteyner otomatik çeviriminde kullanılan parametre tablosu.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Ad (örn. 20' Standart Konteyner)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input"
            />
            <input
              type="number"
              placeholder="Kapasite (kg)"
              value={form.capacity_kg}
              onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })}
              required
              className="input"
            />
            <input
              type="number"
              placeholder="Çuval sayısı (opsiyonel)"
              value={form.bag_count}
              onChange={(e) => setForm({ ...form, bag_count: e.target.value })}
              className="input"
            />
            <input
              type="number"
              placeholder="Çuval ağırlığı kg (opsiyonel)"
              value={form.bag_weight_kg}
              onChange={(e) => setForm({ ...form, bag_weight_kg: e.target.value })}
              className="input"
            />
          </div>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          {success && <p className="text-sm text-[var(--success)]">{success}</p>}
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Ekleniyor…" : "Ekle"}
          </button>
        </form>

        <div className="space-y-2">
          {containerTypes.map((ct) => (
            <div key={ct.id} className="card flex items-center justify-between text-sm">
              <span>
                <strong>{ct.name}</strong> — {formatNumber(ct.capacity_kg, 0)} kg ({ct.capacity_kg / 1000} ton)
                {ct.bag_count ? ` · ${ct.bag_count} çuval x ${ct.bag_weight_kg}kg` : ""}
                {!ct.is_active && " (pasif)"}
              </span>
              <button onClick={() => toggleActive(ct)} className="link text-xs">
                {ct.is_active ? "Pasife al" : "Aktive et"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Yetkili Satıcılar</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Rozeti verilen satıcılar İlanlar sayfasında ve anasayfada "Yetkili Satıcı" olarak öne çıkar.
          </p>
        </div>
        <div className="space-y-2">
          {orgs.filter((o) => o.type === "SELLER").length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">Henüz satıcı organizasyonu yok</p>
          ) : (
            orgs
              .filter((o) => o.type === "SELLER")
              .map((s) => (
                <div key={s.id} className="card flex items-center justify-between text-sm">
                  <span>
                    <strong>{s.name}</strong> {s.country ? `— ${s.country}` : ""}{" "}
                    {s.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
                  </span>
                  <button onClick={() => toggleVerified(s)} className="link text-xs">
                    {s.verified ? "Rozeti kaldır" : "Yetkili Satıcı yap"}
                  </button>
                </div>
              ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Üyelik Talepleri</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Organizasyonların Basic/Premium yükseltme talepleri — onaylarsanız üyelik 30 gün aktive olur,
            reddederseniz hiçbir şey değişmez.
          </p>
        </div>
        <div className="space-y-2">
          {membershipRequests.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">Henüz üyelik talebi yok</p>
          ) : (
            membershipRequests.map((r) => (
              <div key={r.id} className="card flex items-center justify-between text-sm">
                <span>
                  <strong>{r.organization.name}</strong> — {TIER_LABEL[r.requested_tier]} talep etti{" "}
                  <span className="text-[var(--text-tertiary)]">
                    ({new Date(r.created_at).toLocaleDateString("tr-TR")})
                  </span>
                </span>
                {r.status === "PENDING" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => decideMembershipRequest(r, "APPROVED")}
                      className="btn btn-primary !py-1 !px-3 !text-xs"
                    >
                      Kabul Et
                    </button>
                    <button
                      onClick={() => decideMembershipRequest(r, "REJECTED")}
                      className="btn btn-secondary !py-1 !px-3 !text-xs"
                    >
                      Reddet
                    </button>
                  </div>
                ) : (
                  <span
                    className={r.status === "APPROVED" ? "text-[var(--success)]" : "text-[var(--error)]"}
                  >
                    {REQUEST_STATUS_LABEL[r.status]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Üyelik Seviyeleri</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Ödeme entegrasyonu henüz aktif olmadığı için üyelik seviyesi burada elle yönetilir
            (hem satıcı hem roaster organizasyonları için).
          </p>
        </div>
        <div className="space-y-2">
          {orgs.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">Henüz organizasyon yok</p>
          ) : (
            orgs.map((o) => (
              <div key={o.id} className="card flex items-center justify-between text-sm">
                <span>
                  <strong>{o.name}</strong> — {o.type === "SELLER" ? "Satıcı" : "Roaster"}
                </span>
                <select
                  value={o.membership_tier}
                  onChange={(e) => setMembership(o, e.target.value)}
                  className="input !py-1 !text-xs w-32"
                >
                  {Object.entries(TIER_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </section>

      <p className="text-[var(--text-tertiary)] text-sm">Kullanıcı/ürün onayı ekranları ileride eklenecek.</p>
    </div>
  );
}
