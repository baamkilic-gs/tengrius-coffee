"use client";

import { useEffect, useState } from "react";
import { api, getOrganization, getUser, setSession } from "../../../../lib/api";
import { useToast } from "../../../components/Toast";

const TIER_LABEL: Record<string, string> = {
  STANDARD: "Standart",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Onay bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

interface MembershipRequest {
  id: string;
  requested_tier: "BASIC" | "PREMIUM";
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  decided_at: string | null;
}

export default function MembershipPage() {
  const { showToast } = useToast();
  const [org, setOrg] = useState(getOrganization());
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState<"BASIC" | "PREMIUM" | null>(null);

  const loadRequests = () => {
    api("/organizations/membership-requests/mine")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    loadRequests();
    // Admin talebimizi onayladıysa üyelik seviyesi tekrar giriş yapmadan güncel görünsün
    api("/organizations/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((fresh) => {
        if (!fresh) return;
        setOrg(fresh);
        const user = getUser();
        const token = localStorage.getItem("auth_token");
        if (user && token) setSession(token, user, fresh);
      })
      .catch(() => {});
  }, []);

  const pending = requests.find((r) => r.status === "PENDING");
  const latest = requests[0];

  const requestUpgrade = async (tier: "BASIC" | "PREMIUM") => {
    setLoading(tier);
    const res = await api("/organizations/membership-requests", {
      method: "POST",
      body: JSON.stringify({ tier }),
    });
    setLoading(null);
    if (res.ok) {
      showToast("Üyelik talebiniz gönderildi ✓ — admin onayını bekliyor");
      loadRequests();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.message ?? "Talep gönderilemedi", "error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Üyelik</h1>

      <div className="card">
        <p className="text-sm text-[var(--text-tertiary)]">Mevcut üyelik seviyeniz</p>
        <p className="text-xl font-semibold">{TIER_LABEL[org?.membership_tier ?? "STANDARD"]}</p>
        {org?.membership_expires_at && (
          <p className="text-sm text-[var(--text-tertiary)]">
            Bitiş: {new Date(org.membership_expires_at).toLocaleDateString("tr-TR")}
          </p>
        )}
      </div>

      {latest && (
        <div
          className={`card !py-3 text-sm ${
            latest.status === "PENDING"
              ? "border-[var(--color-gold)]"
              : latest.status === "APPROVED"
                ? "border-[var(--success)]"
                : "border-[var(--error)]"
          }`}
        >
          Son talebiniz: <strong>{TIER_LABEL[latest.requested_tier]}</strong> —{" "}
          <span
            className={
              latest.status === "PENDING"
                ? "text-[var(--color-gold)]"
                : latest.status === "APPROVED"
                  ? "text-[var(--success)]"
                  : "text-[var(--error)]"
            }
          >
            {STATUS_LABEL[latest.status]}
          </span>{" "}
          <span className="text-[var(--text-tertiary)]">
            ({new Date(latest.created_at).toLocaleDateString("tr-TR")})
          </span>
        </div>
      )}

      {org?.membership_tier !== "BASIC" && org?.membership_tier !== "PREMIUM" && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Basic'e Yükselt</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Standart'tan sonraki ara kademe — ileride eklenecek ek kampanya ve özelliklere ön koşul olacak,
            şu an için ek bir yetki açmıyor.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            MVP: gerçek ödeme entegrasyonu henüz aktif değil — talebiniz admin onayına gider, onaylanırsa
            üyeliğiniz 30 gün aktive olur.
          </p>
          <button
            onClick={() => requestUpgrade("BASIC")}
            disabled={loading !== null || Boolean(pending)}
            className="btn btn-secondary"
          >
            {loading === "BASIC" ? "Gönderiliyor…" : pending ? "Talebiniz onay bekliyor" : "Basic Talep Et"}
          </button>
        </div>
      )}

      {org?.membership_tier !== "PREMIUM" && (
        <div className="card border-[var(--color-gold)] space-y-3">
          <h2 className="font-semibold">Premium'a Yükselt</h2>
          <ul className="text-sm text-[var(--text-secondary)] list-disc pl-5 space-y-1">
            <li>Teklif verme</li>
            <li>Fiyat alarmı kurma</li>
            <li>Anasayfadaki "Gerçekleşmiş Satışlar"da firma adı ve fiyat detaylarını görme</li>
            <li>(Satıcıysanız) öne çıkan listeleme</li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)]">
            MVP: gerçek ödeme entegrasyonu henüz aktif değil — talebiniz admin onayına gider, onaylanırsa
            üyeliğiniz 30 gün aktive olur.
          </p>
          <button
            onClick={() => requestUpgrade("PREMIUM")}
            disabled={loading !== null || Boolean(pending)}
            className="btn btn-primary"
          >
            {loading === "PREMIUM" ? "Gönderiliyor…" : pending ? "Talebiniz onay bekliyor" : "Premium Talep Et"}
          </button>
        </div>
      )}
    </div>
  );
}
