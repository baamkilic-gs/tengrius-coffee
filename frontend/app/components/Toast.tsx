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
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-[90vw] w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in card !py-3 !px-4 !rounded-[10px] text-sm shadow-lg flex items-center gap-2 ${
              t.variant === "success" ? "border-l-4 border-l-[var(--success)]" : "border-l-4 border-l-[var(--error)]"
            }`}
          >
            <span>{t.variant === "success" ? "✓" : "⚠"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı");
  return ctx;
}
