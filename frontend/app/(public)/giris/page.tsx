"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setSession } from "../../../lib/api";
import CoffeeBean from "../../components/CoffeeBean";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Giriş başarısız");
      return;
    }
    const data = await res.json();
    setSession(data.token, data.user, data.organization);
    router.push("/panel");
  };

  return (
    <div className="min-h-[calc(100dvh-56px)] hero-gradient flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8">
        <div className="flex justify-center mb-4">
          <div className={loading ? "bean-float" : ""}>
            <CoffeeBean size={64} className={loading ? "bean-spin" : ""} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-coffee)] mb-6 text-center">Giriş Yap</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-coffee)] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--color-coffee-dark)] transition-colors disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-[var(--color-coffee)] font-medium underline">
            Kayıt olun
          </Link>
        </p>
      </div>
    </div>
  );
}
