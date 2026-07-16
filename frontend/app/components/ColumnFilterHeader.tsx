"use client";

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

/** D365-tarzı sütun başlığı: sıralama + "içerir" filtresi açılır menüsü. */
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
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1 font-medium normal-case ${
          hasActiveFilter ? "text-[var(--color-gold-light)]" : ""
        }`}
      >
        {label}
        <span className="text-[10px]">▾</span>
      </button>
      {isOpen && (
        <div
          className="absolute z-20 top-full left-0 mt-1 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg p-3 text-left text-[var(--text-primary)] normal-case font-normal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onSort("asc")}
            className="block w-full text-left text-xs py-1 hover:text-[var(--color-coffee)] transition-colors"
          >
            ↑ A'dan Z'ye Sırala
          </button>
          <button
            type="button"
            onClick={() => onSort("desc")}
            className="block w-full text-left text-xs py-1 hover:text-[var(--color-coffee)] transition-colors"
          >
            ↓ Z'den A'ya Sırala
          </button>
          <hr className="border-[var(--border)] my-2" />
          <p className="text-xs text-[var(--text-tertiary)] mb-1">{label} filtresi</p>
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
        </div>
      )}
    </div>
  );
}
