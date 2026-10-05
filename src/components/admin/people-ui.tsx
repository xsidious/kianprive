"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CommissionOverrideInput } from "@/components/admin/CommissionOverrideInput";
import { adminBtnGhost, adminBtnPrimary, adminEyebrow, adminInput, adminMuted, adminStat, adminTitle, statusTone } from "@/components/admin/ui";

export type ChangeLine = { label: string; before: string; after: string };

export function changeLine(label: string, before: string, after: string): ChangeLine | null {
  const from = before.trim() || "—";
  const to = after.trim() || "—";
  if (from === to) return null;
  return { label, before: from, after: to };
}

export function NoticeToast({
  notice,
  onDone,
}: {
  notice: { text: string; error?: boolean } | null;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    if (!notice || notice.error) return;
    const handle = window.setTimeout(() => onDoneRef.current(), 3200);
    return () => window.clearTimeout(handle);
  }, [notice]);

  if (!notice) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-[120] w-[min(92vw,28rem)] -translate-x-1/2">
      <div
        role="status"
        className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(31,26,21,0.18)] ${
          notice.error ? "border-[#e7c4c4] bg-[#fff6f6] text-[#7c2c2c]" : "border-[#d7e6d4] bg-[#f4fbf5] text-[#245c32]"
        }`}
      >
        <p className="text-sm">{notice.text}</p>
        <button type="button" onClick={onDone} className="text-xs uppercase tracking-[0.14em] opacity-70">
          Close
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancelRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#14100bb3] p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-lg rounded-2xl border border-[#e4d5bc] bg-[#fffcf8] p-5 shadow-[0_24px_80px_rgba(31,26,21,0.28)] sm:p-6"
      >
        <h2 id="confirm-dialog-title" className="font-serif text-2xl text-[#1f1a15]">
          {title}
        </h2>
        {message ? <p className="mt-2 text-sm leading-relaxed text-[#6f6251]">{message}</p> : null}
        {children}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className={adminBtnGhost} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={
              danger
                ? "inline-flex items-center justify-center rounded-full bg-[#8a3a3a] px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white disabled:opacity-50"
                : adminBtnPrimary
            }
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChangeList({ changes }: { changes: ChangeLine[] }) {
  if (!changes.length) {
    return <p className="mt-3 text-sm text-[#6f6251]">Nothing has changed.</p>;
  }
  return (
    <ul className="mt-4 max-h-64 space-y-2 overflow-auto">
      {changes.map((change) => (
        <li key={change.label} className="rounded-xl bg-[#fff8ef] px-3 py-2 text-sm">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">{change.label}</p>
          <p className="mt-1 text-[#6f6251] line-through decoration-[#c4b29a]">{change.before}</p>
          <p className="text-[#1f1a15]">{change.after}</p>
        </li>
      ))}
    </ul>
  );
}

export function PeopleHeader({
  eyebrow,
  title,
  description,
  action,
  links,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  links?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className={adminEyebrow}>{eyebrow}</p>
        <h1 className={adminTitle}>{title}</h1>
        <p className={adminMuted}>{description}</p>
        {links ? <div className="mt-4 flex flex-wrap gap-2">{links}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string; hint?: string }[] }) {
  return (
    <div className={`grid gap-3 ${items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.label} className={adminStat}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{item.label}</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-[#6f6251]">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function PersonList({ children, empty }: { children: ReactNode; empty?: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5d7c2]/90 bg-white/90 shadow-[0_12px_40px_rgba(47,36,22,0.05)]">
      {children}
      {empty ? <p className="px-5 py-8 text-sm text-[#6f6251]">{empty}</p> : null}
    </section>
  );
}

export function PersonRow({
  name,
  meta,
  badge,
  onOpen,
}: {
  name: string;
  meta: string;
  badge?: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-4 border-b border-[#efe6d8] px-5 py-4 text-left transition last:border-b-0 hover:bg-[#fff8ef]"
    >
      <span className="min-w-0">
        <span className="block truncate font-medium text-[#1f1a15]">{name}</span>
        <span className="mt-1 block truncate text-sm text-[#6f6251]">{meta}</span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {badge ? (
          <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(badge)}`}>{badge}</span>
        ) : null}
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#8a682e]">Open</span>
      </span>
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 [&_select]:w-full">
      <span className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${adminInput} ${props.className ?? ""}`} />;
}

export function RateList({
  title,
  hint,
  rows,
}: {
  title: string;
  hint?: string;
  rows: {
    id: string;
    label: string;
    note?: string;
    checked?: boolean;
    onChecked?: (checked: boolean) => void;
    rate?: string;
    onRate?: (next: string) => void;
    defaultPct?: string;
  }[];
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">{title}</p>
      {hint ? <p className="mt-1 text-xs text-[#6f6251]">{hint}</p> : null}
      <div className="mt-2 max-h-56 space-y-2 overflow-auto rounded-xl border border-[#efe6d8] bg-[#fffdf9] p-3">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2 text-sm text-[#4f4335]">
              {row.onChecked ? (
                <input type="checkbox" checked={Boolean(row.checked)} onChange={(event) => row.onChecked?.(event.target.checked)} />
              ) : null}
              <span className="min-w-0 flex-1 truncate">
                {row.label}
                {row.note ? <span className="ml-1 text-[10px] uppercase tracking-[0.08em] text-[#8f6f3e]">{row.note}</span> : null}
              </span>
              {row.onRate && (row.onChecked ? row.checked : true) ? (
                <CommissionOverrideInput
                  value={row.rate ?? ""}
                  onChange={row.onRate}
                  defaultPct={row.defaultPct ?? ""}
                  label={`${row.label} commission override`}
                />
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-xs text-[#6f6251]">Nothing to assign yet.</p>
        )}
      </div>
    </div>
  );
}

export function prettySlug(slug: string) {
  return slug.replace(/-/g, " ");
}
