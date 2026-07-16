"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setSession } from "../../../lib/api";
import { COUNTRIES } from "../../../lib/countries";

type OrgType = "SELLER" | "ROASTER";

export default function RegisterPage() {
  const router = useRouter();
  const [orgType, setOrgType] = useState<OrgType>("SELLER");

  // Ortak
  const [orgName, setOrgName] = useState("");
  const [country, setCountry] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Satıcı
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [website, setWebsite] = useState("");
  const [bankIbanTry, setBankIbanTry] = useState("");
  const [bankIbanUsd, setBankIbanUsd] = useState("");
  const [includesVat, setIncludesVat] = useState(false);
  const [nationwideShipping, setNationwideShipping] = useState(false);
  const [sameDayShipping, setSameDayShipping] = useState(false);

  // Roaster
  const [shippingAddress, setShippingAddress] = useState("");
  const [shipToBilling, setShipToBilling] = useState(true);
  const [shippingContactName, setShippingContactName] = useState("");
  const [shippingContactPhone, setShippingContactPhone] = useState("");

  // Zorunlu onaylar
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [securityPolicyAccepted, setSecurityPolicyAccepted] = useState(false);
  const [salesAgreementAccepted, setSalesAgreementAccepted] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!kvkkAccepted || !securityPolicyAccepted || !salesAgreementAccepted) {
      setError("KVKK Aydınlatma Metni, Bilgi Güvenliği Politikası ve Satış Sözleşmesi onayı zorunludur");
      return;
    }

    setLoading(true);
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        email,
        phone,
        password,
        organization_name: orgName,
        organization_type: orgType,
        country,
        kvkk_accepted: kvkkAccepted,
        security_policy_accepted: securityPolicyAccepted,
        sales_agreement_accepted: salesAgreementAccepted,
        ...(orgType === "SELLER"
          ? {
              tax_number: taxNumber,
              tax_office: taxOffice,
              company_legal_name: companyLegalName,
              website,
              bank_iban_try: bankIbanTry || undefined,
              bank_iban_usd: bankIbanUsd || undefined,
              includes_vat: includesVat,
              nationwide_shipping: nationwideShipping,
              same_day_shipping: sameDayShipping,
            }
          : {
              tax_number: taxNumber || undefined,
              tax_office: taxOffice || undefined,
              website: website || undefined,
              shipping_address: shippingAddress,
              ship_to_billing: shipToBilling,
              ...(shipToBilling
                ? {}
                : { shipping_contact_name: shippingContactName, shipping_contact_phone: shippingContactPhone }),
            }),
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
      <div className="card enter-fade-up max-w-lg w-full p-8">
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)] mb-6 text-center">Kayıt Ol</h1>
        <form onSubmit={submit} className="space-y-3">
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">Üyelik Tipi</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrgType("SELLER")}
              className={`rounded-[14px] border px-4 py-3 text-sm text-left transition-colors ${
                orgType === "SELLER"
                  ? "border-[var(--color-coffee)] bg-[var(--surface-alt)]"
                  : "border-[var(--border)]"
              }`}
            >
              <span className="block font-semibold">Çiğ Kahve Satıcısı</span>
              <span className="block text-xs text-[var(--text-tertiary)]">Ürün listeler, teklif alır</span>
            </button>
            <button
              type="button"
              onClick={() => setOrgType("ROASTER")}
              className={`rounded-[14px] border px-4 py-3 text-sm text-left transition-colors ${
                orgType === "ROASTER"
                  ? "border-[var(--color-coffee)] bg-[var(--surface-alt)]"
                  : "border-[var(--border)]"
              }`}
            >
              <span className="block font-semibold">Çiğ Kahve Alıcısı (Roaster)</span>
              <span className="block text-xs text-[var(--text-tertiary)]">Teklif verir, satın alır</span>
            </button>
          </div>

          <hr className="border-[var(--border)] my-2" />

          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">
            Firma Bilgileri
          </p>
          <input
            placeholder="Firma Adı"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            className="input w-full"
          />
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input w-full">
            <option value="">Ülke seçin</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {orgType === "SELLER" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Vergi Numarası"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  required
                  className="input"
                />
                <input
                  placeholder="Vergi Dairesi"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  required
                  className="input"
                />
              </div>
              <input
                placeholder="Şirket Adı (ticari unvan)"
                value={companyLegalName}
                onChange={(e) => setCompanyLegalName(e.target.value)}
                required
                className="input w-full"
              />
              <input
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
                className="input w-full"
              />

              <p className="text-xs text-[var(--text-tertiary)] pt-1">Banka Bilgileri (opsiyonel)</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="TL IBAN"
                  value={bankIbanTry}
                  onChange={(e) => setBankIbanTry(e.target.value)}
                  className="input"
                />
                <input
                  placeholder="USD IBAN"
                  value={bankIbanUsd}
                  onChange={(e) => setBankIbanUsd(e.target.value)}
                  className="input"
                />
              </div>

              <p className="text-xs text-[var(--text-tertiary)] pt-1">
                Öne çıkarma tercihleri (opsiyonel) — bu seçenekleri kabul eden satıcılar ilan listesinde öne çıkarılır
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includesVat} onChange={(e) => setIncludesVat(e.target.checked)} />
                KDV dahil
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={nationwideShipping}
                  onChange={(e) => setNationwideShipping(e.target.checked)}
                />
                Tüm Türkiye nakliye
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sameDayShipping}
                  onChange={(e) => setSameDayShipping(e.target.checked)}
                />
                Aynı gün sevkiyat (15:00'a kadar)
              </label>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Vergi Numarası (opsiyonel)"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="input"
                />
                <input
                  placeholder="Vergi Dairesi (opsiyonel)"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  className="input"
                />
              </div>
              <input
                placeholder="Website (opsiyonel)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input w-full"
              />
              <textarea
                placeholder="Sevk Adresi"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                rows={2}
                className="input w-full"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={shipToBilling}
                  onChange={(e) => setShipToBilling(e.target.checked)}
                />
                Fatura adresine gönderilsin mi?
              </label>
              {!shipToBilling && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Sevkiyat için kişi adı"
                    value={shippingContactName}
                    onChange={(e) => setShippingContactName(e.target.value)}
                    required
                    className="input"
                  />
                  <input
                    placeholder="Sevkiyat için telefon"
                    value={shippingContactPhone}
                    onChange={(e) => setShippingContactPhone(e.target.value)}
                    required
                    className="input"
                  />
                </div>
              )}
            </>
          )}

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
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
            <input
              placeholder="Telefon"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input"
            />
          </div>
          <input
            type="password"
            placeholder="Şifre (en az 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input w-full"
          />

          <hr className="border-[var(--border)] my-2" />

          <div className="space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(e) => setKvkkAccepted(e.target.checked)}
                required
                className="mt-0.5"
              />
              <span>
                <Link href="/kvkk" target="_blank" className="link">
                  KVKK Aydınlatma Metni
                </Link>
                'ni okudum, kabul ediyorum.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={securityPolicyAccepted}
                onChange={(e) => setSecurityPolicyAccepted(e.target.checked)}
                required
                className="mt-0.5"
              />
              <span>
                <Link href="/guvenlik-politikasi" target="_blank" className="link">
                  Bilgi Güvenliği Politikası
                </Link>
                'nı okudum, kabul ediyorum.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={salesAgreementAccepted}
                onChange={(e) => setSalesAgreementAccepted(e.target.checked)}
                required
                className="mt-0.5"
              />
              <span>
                <Link href="/satis-sozlesmesi" target="_blank" className="link">
                  Satış Sözleşmesi
                </Link>
                'ni okudum, kabul ediyorum.
              </span>
            </label>
          </div>

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
