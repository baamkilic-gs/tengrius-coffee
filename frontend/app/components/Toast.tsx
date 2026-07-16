"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ToastItem {
  id: number;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, variant?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Uygulama genelinde küçük onay/hata pop-up'ları (ör. "Teklifiniz gönderildi"). */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 1300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-backdrop fixed inset-0 z-[99] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col gap-3">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`toast-center-in flex items-center gap-3 bg-[var(--surface)] rounded-[14px] shadow-2xl px-6 py-5 border-2 ${
                  t.variant === "success" ? "border-[var(--success)]" : "border-[var(--error)]"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 text-lg ${
                    t.variant === "success"
                      ? "bg-[var(--success-bg)] text-[var(--success)]"
                      : "bg-[var(--error-bg)] text-[var(--error)]"
                  }`}
                >
                  {t.variant === "success" ? "✓" : "⚠"}
                </span>
                <span className="text-base font-semibold text-[var(--text-primary)]">{t.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}
