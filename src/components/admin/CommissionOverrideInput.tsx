"use client";

type Props = {
  value: string;
  onChange: (next: string) => void;
  defaultPct: number | string;
  label?: string;
  className?: string;
};

/** Empty = use person default. Typed value (incl. 0) = per-item override. */
export function CommissionOverrideInput({ value, onChange, defaultPct, label, className }: Props) {
  return (
    <label className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      {label ? <span className="sr-only">{label}</span> : null}
      <input
        type="number"
        min={0}
        max={100}
        step="0.01"
        inputMode="decimal"
        placeholder={`${defaultPct}`}
        title={`Leave blank to use default ${defaultPct}%. Enter a value (including 0) to override.`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[4.5rem] rounded-sm border border-[#b78d4b35] bg-[#fffaf4] px-2 py-1 text-xs text-[#1f1a15]"
      />
      <span className="text-[10px] text-[#8a7d6c]">%</span>
    </label>
  );
}
