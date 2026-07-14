"use client";

import { useState } from "react";
import { api, getOrganization, setSession, getUser } from "../../../../lib/api";

export default function MembershipPage() {
  const [org, setOrg] = useState(getOrganization());
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);
    const res = await api("/organizations/upgrade", { method: "POST" });
    setLoading(false);
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
        <p className="text-xl font-semibold">
          {org?.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
        </p>
        {org?.membership_expires_at && (
          <p className="text-sm text-[var(--text-tertiary)]">
            Bitiş: {new Date(org.membership_expires_at).toLocaleDateString("tr-TR")}
          </p>
        )}
      </div>

      {org?.membership_tier !== "PREMIUM" && (
        <div className="card border-[var(--color-gold)] space-y-3">
          <h2 className="font-semibold">Premium'a Yükselt</h2>
          <ul className="text-sm text-[var(--text-secondary)] list-disc pl-5 space-y-1">
            <li>Teklif verme</li>
            <li>Fiyat alarmı kurma</li>
            <li>Satın alma işlemi yapma</li>
            <li>(Satıcıysanız) öne çıkan listeleme</li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)]">
            MVP: gerçek ödeme entegrasyonu henüz aktif değil, bu buton üyeliği demo amaçlı 30 gün aktive eder.
          </p>
          <button onClick={upgrade} disabled={loading} className="btn btn-primary">
            {loading ? "İşleniyor…" : "Premium'a Yükselt"}
          </button>
        </div>
      )}
    </div>
  );
}
