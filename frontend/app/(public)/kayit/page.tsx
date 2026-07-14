"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setSession } from "../../../lib/api";
import { COUNTRIES } from "../../../lib/countries";

export default function RegisterPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("BUYER");
  const [country, setCountry] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        organization_name: orgName,
        organization_type: orgType,
        country,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Kayıt başarısız");
      return;
    }
    const data = await res.json();
    setSession(data.token, data.user, data.organization);
    router.push("/panel");
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] hero-gradient flex items-center justify-center px-6 py-12">
      <div className="card enter-fade-up max-w-sm w-full p-8">
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)] mb-6 text-center">Kayıt Ol</h1>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">
            Firma Bilgileri
          </p>
          <input
            placeholder="Firma / Organizasyon Adı"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="input w-full"
          />
          <select value={orgType} onChange={(e) => setOrgType(e.target.value)} className="input w-full">
            <option value="ROASTER">Roaster (kavrulmuş kahve üreticisi)</option>
            <option value="BUYER">Çiğ kahve alıcısı</option>
            <option value="SELLER">Satıcı</option>
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input w-full">
            <option value="">Ülke seçin</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <hr className="border-[var(--border)] my-2" />

          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">
            Kişisel Bilgiler
          </p>
          <input
            placeholder="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="input w-full"
          />
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input w-full"
          />
          <input
            type="password"
            placeholder="Şifre (en az 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input w-full"
          />

          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
          </button>
        </form>
        <p className="text-sm text-[var(--text-secondary)] mt-4 text-center">
          Zaten hesabınız var mı? <Link href="/giris" className="link font-medium">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
}
