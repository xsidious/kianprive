"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PortalSignOut } from "@/components/auth/PortalSignOut";
import { IntakeMessageThread } from "@/components/intake/IntakeMessageThread";
import { TherapyAcceptPay } from "@/components/intake/TherapyAcceptPay";

type TherapyInfo = {
  status: string;
  providerName: string;
  notes: string | null;
  items: Array<{ title: string; quantity: number }>;
  order: {
    id: string;
    orderNumber: string;
    total?: number;
    paymentStatus: string;
  } | null;
};

type IntakeRow = {
  id: string;
  referenceId: string;
  fullName: string;
  status: string;
  statusLabel: string;
  statusNote: string | null;
  submittedAt: string;
  updatedAt: string;
  messageCount?: number;
  latestMessage?: {
    id: string;
    authorRole: string;
    authorLabel: string;
    body: string;
    createdAt: string;
  } | null;
  orders: Array<{
    id?: string;
    orderNumber: string;
    paymentStatus: string;
    status: string;
    fulfillmentStatus?: string;
    progress?: { label: string; detail: string; step: number; tone: string };
    total?: number;
  }>;
  therapy: TherapyInfo | null;
};

function pickDefaultOpenId(rows: IntakeRow[]) {
  const awaitingPay = rows.find(
    (r) => r.therapy?.order && r.therapy.order.paymentStatus !== "PAID",
  );
  if (awaitingPay) return awaitingPay.id;

  const withProviderMsg = rows.find((r) => r.latestMessage?.authorRole === "PROVIDER");
  if (withProviderMsg) return withProviderMsg.id;

  const withMessages = [...rows].sort((a, b) => (b.messageCount ?? 0) - (a.messageCount ?? 0))[0];
  if (withMessages && (withMessages.messageCount ?? 0) > 0) return withMessages.id;

  return rows[0]?.id ?? null;
}

export default function MemberIntakePage() {
  const [intakes, setIntakes] = useState<IntakeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/member/intake");
    if (!res.ok) {
      setError("Could not load your intake requests.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { intakes: IntakeRow[] };
    const rows = data.intakes ?? [];
    setIntakes(rows);
    setOpenId((prev) => {
      if (prev && rows.some((r) => r.id === prev)) return prev;
      return pickDefaultOpenId(rows);
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Members</p>
          <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">My clinical intake</h1>
          <p className="mt-2 text-sm text-[#6f6251]">
            Track Provider Connect / Wellness Hub requests, review recommended therapy, and reply when the clinical
            team asks for more.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/therapeutics"
            className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm text-[#6f6251]"
          >
            Catalog
          </Link>
          <Link href="/dashboard" className="rounded-full border border-[#d8cbb5] px-4 py-2 text-sm text-[#6f6251]">
            Dashboard
          </Link>
          <PortalSignOut />
        </div>
      </div>

      {loading ? <p className="mt-8 text-sm text-[#6f6251]">Loading…</p> : null}
      {error ? <p className="mt-8 text-sm text-red-700">{error}</p> : null}

      {!loading && !error && intakes.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-6 text-sm text-[#6f6251]">
          No intake requests found yet. After you submit on Wellness Hub, they will appear here.
          <div className="mt-4">
            <Link href="/track-intake" className="text-[#8f6f3e] underline underline-offset-2">
              Track with email + request code
            </Link>
          </div>
        </div>
      ) : null}

      <ul className="mt-8 space-y-4">
        {intakes.map((row) => (
          <li key={row.id} className="space-y-4 rounded-2xl border border-[#e7dcc8] bg-white p-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">{row.statusLabel}</p>
              <h2 className="mt-1 font-serif text-xl text-[#1f1a15]">{row.fullName}</h2>
              <p className="mt-1 font-mono text-xs tracking-[0.12em] text-[#8a7d6c]">{row.referenceId}</p>
              {row.statusNote ? (
                <p className="mt-3 rounded-lg bg-[#fcfaf6] px-3 py-2 text-sm text-[#1f1a15]">
                  Latest note: {row.statusNote}
                </p>
              ) : null}
              {(row.messageCount ?? 0) > 0 && row.latestMessage ? (
                <p className="mt-3 line-clamp-2 rounded-lg border border-[#efe4d4] bg-[#fffaf3] px-3 py-2 text-sm text-[#2b2218]">
                  <span className="text-[#8f6f3e]">{row.latestMessage.authorLabel}:</span> {row.latestMessage.body}
                  <span className="mt-1 block text-xs text-[#8a7d6c]">
                    {row.messageCount} message{(row.messageCount ?? 0) === 1 ? "" : "s"}
                  </span>
                </p>
              ) : null}
              <p className="mt-2 text-xs text-[#8a7d6c]">
                Submitted {new Date(row.submittedAt).toLocaleString()} · Updated{" "}
                {new Date(row.updatedAt).toLocaleString()}
              </p>
              {row.orders.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm text-[#1f1a15]">
                  {row.orders.map((order) => (
                    <li key={order.orderNumber}>
                      {order.id ? (
                        <Link href={`/dashboard/orders/${order.id}`} className="text-[#8f6f3e] underline">
                          Order {order.orderNumber}
                        </Link>
                      ) : (
                        <>Order {order.orderNumber}</>
                      )}
                      : {order.progress?.label ?? order.status}
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === row.id ? null : row.id))}
                className="mt-3 text-sm text-[#8f6f3e] underline underline-offset-2"
              >
                {openId === row.id ? "Hide messages" : "View / reply to messages"}
                {(row.messageCount ?? 0) > 0 ? ` (${row.messageCount})` : ""}
              </button>
            </div>

            {row.therapy ? (
              <div className="rounded-xl border border-[#efe4d4] bg-[#fffaf3] p-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">
                  Recommended therapy · {row.therapy.status}
                </p>
                <p className="mt-1 text-sm text-[#6f6251]">From {row.therapy.providerName}</p>
                {row.therapy.notes ? (
                  <p className="mt-2 text-sm text-[#1f1a15]">{row.therapy.notes}</p>
                ) : null}
                <ul className="mt-3 space-y-1 text-sm text-[#1f1a15]">
                  {row.therapy.items.map((item, idx) => (
                    <li key={`${item.title}-${idx}`}>
                      {item.title} × {item.quantity}
                    </li>
                  ))}
                </ul>
                {row.therapy.order &&
                row.therapy.order.paymentStatus !== "PAID" &&
                typeof row.therapy.order.total === "number" ? (
                  <div className="mt-4">
                    <TherapyAcceptPay
                      orderId={row.therapy.order.id}
                      total={row.therapy.order.total}
                      orderNumber={row.therapy.order.orderNumber}
                      onPaid={() => void load()}
                    />
                  </div>
                ) : null}
                {row.therapy.order?.paymentStatus === "PAID" ? (
                  <p className="mt-3 text-sm text-[#1b6568]">
                    Paid — order {row.therapy.order.orderNumber}. Our team will fulfill your therapy products.
                  </p>
                ) : null}
              </div>
            ) : null}

            {openId === row.id ? (
              <IntakeMessageThread
                title="Messages"
                hint="Reply when your clinical team asks for labs, documents, or clarifications."
                placeholder="Type your reply…"
                submitLabel="Send reply"
                reloadKey={row.id}
                loadMessages={async () => {
                  const res = await fetch(
                    `/api/member/intake/messages?intakeId=${encodeURIComponent(row.id)}`,
                  );
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Could not load messages.");
                  return data.messages ?? [];
                }}
                sendMessage={async (body) => {
                  const res = await fetch("/api/member/intake/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ intakeId: row.id, referenceId: row.referenceId, body }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Could not send reply.");
                  if (!data.message) throw new Error("Message was not returned from the server.");
                  return data.message;
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
