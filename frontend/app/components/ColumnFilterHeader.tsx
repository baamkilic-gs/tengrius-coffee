"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ColumnFilterHeaderProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onSort: (dir: "asc" | "desc") => void;
  filterDraft: string;
  onFilterDraftChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  hasActiveFilter: boolean;
}

const POPOVER_WIDTH = 224; // w-56

/**
 * D365-tarzı sütun başlığı: sıralama + "içerir" filtresi açılır menüsü.
 * Açılır menü, tablo genelde yatayda kaydırılan (overflow-x-auto) bir kapta
 * olduğu için position:absolute ile kesiliyordu — bunun yerine document.body'ye
 * portal edilip düğmenin konumuna göre position:fixed ile yerleştiriliyor.
 */
export default function ColumnFilterHeader({
  label,
  isOpen,
  onToggle,
  onSort,
  filterDraft,
  onFilterDraftChange,
  onApply,
  onClear,
  hasActiveFilter,
}: ColumnFilterHeaderProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }
    const updatePos = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8),
      });
    };
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [isOpen]);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1 font-medium normal-case ${
          hasActiveFilter ? "text-[var(--color-gold-light)]" : ""
        }`}
      >
        {label}
        <span className="text-[10px]">▾</span>
      </button>
      {isOpen &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-30 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 text-left text-[var(--text-primary)] normal-case font-normal text-xs"
            style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onSort("asc")}
              className="block w-full text-left py-1 hover:text-[var(--color-coffee)] transition-colors"
            >
              ↑ A'dan Z'ye Sırala
            </button>
            <button
              type="button"
              onClick={() => onSort("desc")}
              className="block w-full text-left py-1 hover:text-[var(--color-coffee)] transition-colors"
            >
              ↓ Z'den A'ya Sırala
            </button>
            <hr className="border-[var(--border)] my-2" />
            <p className="text-[var(--text-tertiary)] mb-1">{label} filtresi</p>
            <select disabled defaultValue="contains" className="input !py-1 !text-xs w-full mb-2 opacity-70">
              <option value="contains">İçerir</option>
            </select>
            <input
              value={filterDraft}
              onChange={(e) => onFilterDraftChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onApply()}
              placeholder="Değer girin"
              className="input !py-1 !text-xs w-full mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={onApply} className="btn btn-primary !py-1 !px-3 !text-xs flex-1">
                Uygula
              </button>
              <button
                type="button"
                onClick={onClear}
                className="border border-[var(--border)] rounded-full !py-1 !px-3 !text-xs hover:border-[var(--color-gold)] transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
