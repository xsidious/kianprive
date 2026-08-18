"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminEyebrow,
  adminMuted,
  adminPanel,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";

type Subscription = {
  id: string;
  status: string;
  intervalLabel: string;
  amount: number;
  nextChargeLabel: string | null;
  lastChargedLabel: string | null;
  cardLast4: string | null;
  hasCardOnFile: boolean;
  failureCount: number;
  lastError: string | null;
  patient: { id: string; fullName: string; email: string };
  items: Array<{ title: string; quantity: number }>;
  orders: Array<{ id: string; orderNumber: string; total: number; paymentStatus: string }>;
};

export default function AdminTherapySubscriptionsPage() {
  const [rows, setRows] = useState<Subscription[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/therapy-subscriptions");
    if (!res.ok) {
      setStatus("Could not load therapy billing.");
      return;
    }
    const data = (await res.json()) as { subscriptions: Subscription[] };
    setRows(data.subscriptions);
  }

  useEffect(() => {
    void load();
  }, []);

  async function act(action: string, id?: string) {
    setBusy(id || action);
    setStatus("");
    const res = await fetch("/api/admin/therapy-subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setStatus(data.error || "Action failed.");
      return;
    }
    if (data.error) setStatus(data.error);
    else if (action === "runDue") setStatus(`Processed ${data.results?.length ?? 0} due refill(s).`);
    else if (action === "charge" && data.ok === false) setStatus(data.error || "Charge failed.");
    else setStatus("Updated.");
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={adminEyebrow}>Commerce</p>
          <h1 className={adminTitle}>Therapy billing</h1>
          <p className={`${adminMuted} mt-1 max-w-2xl`}>
            Recurring therapy charges the saved card on the interval set when the plan was sent. Run due charges
            here if the daily job has not run yet.
          </p>
        </div>
        <button
          type="button"
          className={adminBtnPrimary}
          disabled={busy === "runDue"}
          onClick={() => void act("runDue")}
        >
          Run due charges
        </button>
      </header>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <section className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl text-[#1f1a15]">{row.patient.fullName}</p>
                <p className="text-sm text-[#6f6251]">
                  {row.patient.email} · {row.intervalLabel} · {money(row.amount)}
                </p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(row.status)}`}>
                {row.status}
              </span>
            </div>
            <ul className="mt-3 text-sm text-[#4f4335]">
              {row.items.map((item, idx) => (
                <li key={`${item.title}-${idx}`}>
                  {item.title} × {item.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[#6f6251]">
              {row.hasCardOnFile
                ? `Card on file${row.cardLast4 ? ` ending ${row.cardLast4}` : ""}`
                : "No card on file yet"}
              {row.lastChargedLabel ? ` · Last charged ${row.lastChargedLabel}` : ""}
              {row.nextChargeLabel ? ` · Next ${row.nextChargeLabel}` : ""}
            </p>
            {row.lastError ? <p className="mt-2 text-sm text-[#7c2c2c]">{row.lastError}</p> : null}
            {row.orders.length ? (
              <p className="mt-2 text-xs text-[#8f6f3e]">
                Recent: {row.orders.map((order) => `${order.orderNumber} (${order.paymentStatus})`).join(" · ")}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={adminBtnPrimary}
                disabled={Boolean(busy)}
                onClick={() => void act("charge", row.id)}
              >
                Charge now
              </button>
              {row.status === "PAUSED" ? (
                <button type="button" className={adminBtnGhost} disabled={Boolean(busy)} onClick={() => void act("resume", row.id)}>
                  Resume
                </button>
              ) : row.status !== "CANCELED" && row.status !== "PENDING" ? (
                <button type="button" className={adminBtnGhost} disabled={Boolean(busy)} onClick={() => void act("pause", row.id)}>
                  Pause
                </button>
              ) : null}
              {row.status !== "CANCELED" ? (
                <button type="button" className={adminBtnGhost} disabled={Boolean(busy)} onClick={() => void act("cancel", row.id)}>
                  Cancel
                </button>
              ) : null}
              <Link href="/admin/intake" className={`${adminBtnGhost} inline-flex items-center`}>
                Open intake
              </Link>
            </div>
          </article>
        ))}
        {!rows.length ? <p className="text-sm text-[#6f6251]">No therapy subscriptions yet. Set a refill interval when sending therapy.</p> : null}
      </section>
    </div>
  );
}
