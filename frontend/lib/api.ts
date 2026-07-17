/**
 * Tüm backend çağrıları bu yardımcıdan geçer:
 *  - API adresi NEXT_PUBLIC_API_URL ortam değişkeninden gelir (yayında değişir)
 *  - Oturum token'ı her isteğe otomatik eklenir
 *  - 401 dönerse oturum temizlenip giriş sayfasına yönlendirilir
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: "MEMBER" | "ADMIN";
}

export interface AuthOrganization {
  id: string;
  name: string;
  type: "SELLER" | "ROASTER";
  country: string | null;
  membership_tier: "STANDARD" | "BASIC" | "PREMIUM";
  membership_expires_at: string | null;
  verified: boolean;
}

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

export const getUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getOrganization = (): AuthOrganization | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_org");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = (token: string, user: AuthUser, organization: AuthOrganization) => {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
  localStorage.setItem("auth_org", JSON.stringify(organization));
};

export const clearSession = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_org");
};

export async function api(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    // fetch, ağ hatası/CORS engeli gibi durumlarda reject eder — bu, çağıran
    // sayfalarda "await api(...)" sonrası hiç dönmeyen (ör. "Giriş yapılıyor…"
    // durumunda sonsuza kadar takılı kalan) bir Promise'e yol açardı. Burada
    // normal bir "başarısız" Response'a çeviriyoruz ki her çağıran, zaten
    // yazdığı res.ok/err.message mantığıyla düzgün bir hata gösterebilsin.
    return new Response(
      JSON.stringify({ message: "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  // Oturum düşmüşse girişe yönlendir (login isteğinin kendisi hariç)
  if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/login")) {
    clearSession();
    if (window.location.pathname !== "/giris") {
      window.location.href = "/giris";
    }
  }

  return res;
}
