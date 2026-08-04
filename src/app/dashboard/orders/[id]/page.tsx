"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OrderMessageThread, type OrderThreadMessage } from "@/components/orders/OrderMessageThread";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaSecondary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

type Progress = {
  label: string;
  detail: string;
  step: number;
  tone: string;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  createdAt: string;
  notes: string | null;
  progress: Progress;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    sku?: string | null;
    product?: { featuredImage?: string | null; slug?: string | null } | null;
  }>;
  fulfillments: Array<{
    id: string;
    status: string;
    carrier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    notes?: string | null;
  }>;
  therapyProposal?: { id: string; status: string; intakeRef?: string | null } | null;
};

function progressTone(tone: string) {
  if (tone === "done" || tone === "shipped") return "bg-[#ecfff3] text-[#1f7e45]";
  if (tone === "paid") return "bg-[#fff6e8] text-[#8f6f3e]";
  if (tone === "issue") return "bg-[#fdeeee] text-[#7c2c2c]";
  return "bg-[#f3f0ea] text-[#6f6251]";
}

const STEPS = ["Payment", "Preparing", "Shipped", "Delivered"] as const;

export default function MemberOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/member/orders/${orderId}`);
        const data = (await res.json()) as { order?: OrderDetail; error?: string };
        if (!res.ok || !data.order) throw new Error(data.error || "Order not found.");
        if (!cancelled) setOrder(data.order);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const loadMessages = useCallback(async () => {
    if (!orderId) return [];
    const res = await fetch(`/api/member/orders/${orderId}/messages`);
    const data = (await res.json()) as { messages?: OrderThreadMessage[]; error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load messages.");
    return data.messages ?? [];
  }, [orderId]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!orderId) throw new Error("Missing order.");
      const res = await fetch(`/api/member/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as { message?: OrderThreadMessage; error?: string };
      if (!res.ok || !data.message) throw new Error(data.error || "Could not send message.");
      return data.message;
    },
    [orderId],
  );

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <EditorialEyebrow>ORDER DETAIL</EditorialEyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#1f1a15]">
              {order?.orderNumber ?? (loading ? "Loading…" : "Order")}
            </h1>
            {order ? (
              <p className="mt-2 text-sm text-[#6f6251]">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <Link href="/dashboard/orders" className={editorialCtaSecondary}>
            All orders
          </Link>
        </div>

        {error ? <p className="mt-6 text-sm text-red-700">{error}</p> : null}

        {order ? (
          <div className="mt-10 space-y-6">
            <section className={`${editorialPanel} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl text-[#1f1a15]">{order.progress.label}</p>
                  <p className="mt-1 text-sm text-[#6f6251]">{order.progress.detail}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${progressTone(order.progress.tone)}`}
                >
                  {order.progress.label}
                </span>
              </div>
              <ol className="mt-6 grid gap-2 sm:grid-cols-4">
                {STEPS.map((label, index) => {
                  const stepNum = index + 1;
                  const done = order.progress.step >= stepNum;
                  const current = order.progress.step === stepNum;
                  return (
                    <li
                      key={label}
                      className={`rounded-xl border px-3 py-3 text-center text-xs tracking-[0.12em] ${
                        done
                          ? "border-[#c4a574] bg-[#fff6e8] text-[#8f6f3e]"
                          : "border-[#efe4d4] bg-white text-[#a39684]"
                      } ${current ? "ring-1 ring-[#8f6f3e]" : ""}`}
                    >
                      <span className="block text-[10px] uppercase">Step {stepNum}</span>
                      <span className="mt-1 block font-medium normal-case tracking-normal">{label}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className={`${editorialPanel} space-y-3 p-5`}>
              <h2 className="font-serif text-xl text-[#1f1a15]">Items</h2>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-[#efe4d4] pb-3 last:border-0 last:pb-0">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-[#efe4d4]">
                    {item.product?.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#1f1a15]">{item.title}</p>
                    <p className="text-xs text-[#6f6251]">
                      Qty {item.quantity}
                      {item.sku ? ` · SKU ${item.sku}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {(order.fulfillments?.length ?? 0) > 0 ? (
              <section className={`${editorialPanel} p-5`}>
                <h2 className="font-serif text-xl text-[#1f1a15]">Shipping &amp; tracking</h2>
                <ul className="mt-3 space-y-3 text-sm">
                  {order.fulfillments.map((f) => (
                    <li key={f.id} className="rounded-xl border border-[#efe4d4] bg-white p-3">
                      <p className="text-[#2b2218]">
                        {f.status.replaceAll("_", " ")}
                        {f.carrier ? ` · ${f.carrier}` : ""}
                      </p>
                      {f.trackingNumber ? (
                        <p className="mt-1 font-mono text-xs text-[#1b6568]">{f.trackingNumber}</p>
                      ) : null}
                      {f.trackingUrl ? (
                        <a
                          href={f.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-[#8f6f3e] underline"
                        >
                          Track shipment
                        </a>
                      ) : null}
                      {f.notes ? <p className="mt-2 text-xs text-[#6f6251]">{f.notes}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {order.therapyProposal?.intakeRef ? (
              <p className="text-sm text-[#6f6251]">
                Related intake:{" "}
                <Link href="/dashboard/intake" className="text-[#8f6f3e] underline">
                  {order.therapyProposal.intakeRef}
                </Link>
              </p>
            ) : null}

            <OrderMessageThread
              reloadKey={order.id}
              selfRole="CUSTOMER"
              title="Messages with KIAN Privé"
              hint="Ask about progress, shipping, or anything else. Our team replies here."
              placeholder="Ask a question about this order…"
              loadMessages={loadMessages}
              sendMessage={sendMessage}
            />
          </div>
        ) : null}

        {loading && !order ? <p className="mt-8 text-sm text-[#6f6251]">Loading order…</p> : null}
      </EditorialSection>
    </div>
  );
}
