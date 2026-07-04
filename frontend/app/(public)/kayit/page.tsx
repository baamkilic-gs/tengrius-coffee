"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setSession } from "../../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("BUYER");
  const [country, setCountry] = useState("");
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
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)] mb-6">Kayıt Ol</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Ad Soyad"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <hr className="border-gray-200" />
        <input
          placeholder="Firma / Organizasyon Adı"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="BUYER">Alıcıyım</option>
          <option value="SELLER">Satıcıyım</option>
          <option value="BOTH">Her ikisi</option>
        </select>
        <input
          placeholder="Ülke"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-coffee)] text-white py-2 rounded text-sm disabled:opacity-50"
        >
          {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="underline">
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}
