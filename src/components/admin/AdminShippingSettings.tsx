"use client";

import { FormEvent, useEffect, useState } from "react";
import { adminBtnPrimary, adminInput, adminPanel } from "@/components/admin/ui";

type ShippingConfig = {
  freeThreshold: number;
  flatRate: number;
  alwaysFree: boolean;
};

const defaults: ShippingConfig = {
  freeThreshold: 150,
  flatRate: 12,
  alwaysFree: false,
};

export function AdminShippingSettings() {
  const [config, setConfig] = useState<ShippingConfig>(defaults);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/commerce/shipping");
      if (!res.ok) return;
      const data = (await res.json()) as { config: ShippingConfig };
      if (data.config) setConfig(data.config);
    })();
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/commerce/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeThreshold: Number(config.freeThreshold),
          flatRate: Number(config.flatRate),
          alwaysFree: Boolean(config.alwaysFree),
        }),
      });
      const data = (await res.json()) as { config?: ShippingConfig; error?: string };
      if (!res.ok || !data.config) throw new Error(data.error || "Save failed");
      setConfig(data.config);
      setStatus(
        data.config.alwaysFree
          ? "Saved — shipping is always free."
          : `Saved — free at $${data.config.freeThreshold}+, otherwise $${data.config.flatRate}.`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save shipping settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSave} className={`${adminPanel} space-y-4 p-5`}>
      <div>
        <h2 className="font-serif text-xl text-[#1f1a15]">Shipping</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          Controls shop checkout, invoice defaults, and the starting shipping amount on clinical therapy pricing.
        </p>
      </div>

      <label className="flex items-center gap-3 text-sm text-[#2b2218]">
        <input
          type="checkbox"
          checked={config.alwaysFree}
          onChange={(e) => setConfig((c) => ({ ...c, alwaysFree: e.target.checked }))}
          className="h-4 w-4 accent-[#8f6f3e]"
        />
        Always free shipping
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            Free shipping threshold ($)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            disabled={config.alwaysFree}
            value={config.freeThreshold}
            onChange={(e) => setConfig((c) => ({ ...c, freeThreshold: Number(e.target.value) }))}
            className={`${adminInput} w-full disabled:opacity-50`}
          />
          <span className="mt-1 block text-xs text-[#8a7d6c]">Orders at or above this amount ship free.</span>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            Standard shipping rate ($)
          </span>
          <input
            type="number"
            min={0}
            step={0.01}
            disabled={config.alwaysFree}
            value={config.flatRate}
            onChange={(e) => setConfig((c) => ({ ...c, flatRate: Number(e.target.value) }))}
            className={`${adminInput} w-full disabled:opacity-50`}
          />
          <span className="mt-1 block text-xs text-[#8a7d6c]">Charged when under the free threshold.</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={adminBtnPrimary}>
          {busy ? "Saving…" : "Save shipping"}
        </button>
        {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
      </div>
    </form>
  );
}
