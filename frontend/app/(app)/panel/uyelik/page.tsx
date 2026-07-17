"use client";

import { useState } from "react";
import { api, getOrganization, setSession, getUser } from "../../../../lib/api";

const TIER_LABEL: Record<string, string> = {
  STANDARD: "Standart",
  BASIC: "Basic",
  PREMIUM: "Premium",
};

export default function MembershipPage() {
  const [org, setOrg] = useState(getOrganization());
  const [loading, setLoading] = useState<"BASIC" | "PREMIUM" | null>(null);

  const upgrade = async (tier: "BASIC" | "PREMIUM") => {
    setLoading(tier);
    const res = await api("/organizations/upgrade", { method: "POST", body: JSON.stringify({ tier }) });
    setLoading(null);
    if (res.ok) {
      const updated = await res.json();
      const user = getUser();
      const token = localStorage.getItem("auth_token");
      if (user && token) setSession(token, user, updated);
      setOrg(updated);
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

      {org?.membership_tier !== "BASIC" && org?.membership_tier !== "PREMIUM" && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Basic'e Yükselt</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Standart'tan sonraki ara kademe — ileride eklenecek ek kampanya ve özelliklere ön koşul olacak,
            şu an için ek bir yetki açmıyor.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            MVP: gerçek ödeme entegrasyonu henüz aktif değil, bu buton üyeliği demo amaçlı 30 gün aktive eder.
          </p>
          <button onClick={() => upgrade("BASIC")} disabled={loading !== null} className="btn btn-secondary">
            {loading === "BASIC" ? "İşleniyor…" : "Basic'e Yükselt"}
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
            MVP: gerçek ödeme entegrasyonu henüz aktif değil, bu buton üyeliği demo amaçlı 30 gün aktive eder.
          </p>
          <button onClick={() => upgrade("PREMIUM")} disabled={loading !== null} className="btn btn-primary">
            {loading === "PREMIUM" ? "İşleniyor…" : "Premium'a Yükselt"}
          </button>
        </div>
      )}
    </div>
  );
}
