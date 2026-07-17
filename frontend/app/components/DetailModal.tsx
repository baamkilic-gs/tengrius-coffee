"use client";

import { useEffect } from "react";

interface DetailModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

/** Liste satırındaki bir numaraya tıklayınca (veya bir form açmak için) açılan modal kart. */
export default function DetailModal({ title, onClose, children, maxWidth = "max-w-lg" }: DetailModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`card ${maxWidth} w-full max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-coffee)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--color-coffee)] text-xl leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
