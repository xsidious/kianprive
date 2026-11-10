"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminModal } from "@/components/admin/AdminModal";
import { OrderMessageThread, type OrderThreadMessage } from "@/components/orders/OrderMessageThread";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSoft,
  adminEyebrow,
  adminInput,
  adminMuted,
  adminPanel,
  adminSelect,
  adminTitle,
  money,
  statusTone,
} from "@/components/admin/ui";
import { orderIncludesPeptides } from "@/lib/commerce/peptide-orders";

type OrderItem = {
  id: string;
  title: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  product?: { featuredImage?: string | null; slug?: string; category?: string | null; catalogKind?: string | null } | null;
};

type Order = {
  id: string;
  orderNumber: string;
  email: string | null;
  phone?: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal?: number | string;
  shippingTotal?: number | string;
  taxTotal?: number | string;
  discountTotal?: number | string;
  total?: number | string;
  createdAt?: string;
  authorizeNetTransId?: string | null;
  distributionOrderId?: string | null;
  distributionStatus?: string | null;
  rxhereOrderId?: string | null;
  distributionSyncError?: string | null;
  shippingAddress?: Record<string, string> | null;
  notes?: string | null;
  items?: OrderItem[];
  payments?: Array<{
    id: string;
    provider: string;
    status: string;
    amount: number | string;
    metadata?: { transId?: string; authCode?: string; testMode?: boolean } | null;
  }>;
  fulfillments?: { id: string; carrier?: string | null; trackingNumber?: string | null; trackingUrl?: string | null; status: string }[];
  partner?: { displayName: string; partnerCode: string; type?: string } | null;
  intakeSubmission?: {
    id: string;
    fullName: string;
    email: string;
    publicTrackingToken?: string | null;
    status: string;
  } | null;
  therapyProposal?: { id: string; status: string; notes?: string | null } | null;
};

const orderStatuses = ["PENDING", "PAID", "PROCESSING", "FULFILLED", "DELIVERED", "CANCELED", "REFUNDED"] as const;
const paymentStatuses = ["UNPAID", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "FAILED"] as const;
const fulfillmentStatuses = ["UNFULFILLED", "PROCESSING", "PARTIALLY_FULFILLED", "FULFILLED", "DELIVERED"] as const;

function paymentAmountPaid(order: Order) {
  const paidStatuses = new Set(["PAID", "CAPTURED", "SETTLED", "SUCCEEDED", "SUCCESS"]);
  const fromPayments = (order.payments ?? [])
    .filter((pay) => paidStatuses.has(String(pay.status || "").toUpperCase()))
    .reduce((sum, pay) => sum + Number(pay.amount ?? 0), 0);
  if (fromPayments > 0) return fromPayments;
  return Number(order.total ?? 0);
}

function orderSubtotal(order: Order) {
  const stored = Number(order.subtotal ?? 0);
  if (stored > 0) return stored;
  return (order.items ?? []).reduce((sum, item) => sum + Number(item.lineTotal ?? 0), 0);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<"all" | "shop" | "therapy" | "GLP">("all");
  const [query, setQuery] = useState("");
  const [syncingDistribution, setSyncingDistribution] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function loadOrders() {
    const res = await fetch("/api/admin/commerce/orders");
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus(
        res.status === 401 || res.status === 403
          ? "Not authorized to load orders — sign in again as admin."
          : payload.error || `Failed to load orders (${res.status}).`,
      );
      return;
    }
    const payload = (await res.json()) as { orders: Order[] };
    setOrders(payload.orders);
    setStatus(`Loaded ${payload.orders.length} order(s).`);
  }

  async function retryDistribution(orderId: string) {
    setRetryingId(orderId);
    setStatus("Retrying Wellness Tech → Rx Here…");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/retry-distribution`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        order?: {
          distributionOrderId?: string | null;
          distributionStatus?: string | null;
          rxhereOrderId?: string | null;
          distributionSyncError?: string | null;
        };
      };
      if (!res.ok || !data.ok) {
        setStatus(data.error || "Pharmacy retry failed.");
        await loadOrders();
        return;
      }
      setStatus(
        data.order?.rxhereOrderId
          ? `Pharmacy accepted · Eventide ${data.order.rxhereOrderId}`
          : "Sent to Wellness Tech. Waiting on pharmacy id.",
      );
      await loadOrders();
    } finally {
      setRetryingId(null);
    }
  }

  async function refreshDistributionStatuses() {
    setSyncingDistribution(true);
    setStatus("Refreshing pharmacy / shipping status…");
    try {
      const res = await fetch("/api/admin/orders/sync-distribution", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        checked?: number;
        updated?: number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus(data.error || "Could not refresh distribution status.");
        return;
      }
      setStatus(`Distribution sync · checked ${data.checked ?? 0} · updated ${data.updated ?? 0}.`);
      await loadOrders();
    } finally {
      setSyncingDistribution(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const loadOrderMessages = useCallback(async () => {
    if (!selectedId) return [];
    const res = await fetch(`/api/admin/commerce/orders/${selectedId}/messages`);
    const data = (await res.json()) as { messages?: OrderThreadMessage[]; error?: string };
    if (!res.ok) throw new Error(data.error || "Could not load messages.");
    return data.messages ?? [];
  }, [selectedId]);

  const sendOrderMessage = useCallback(
    async (body: string) => {
      if (!selectedId) throw new Error("No order selected.");
      const res = await fetch(`/api/admin/commerce/orders/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await res.json()) as { message?: OrderThreadMessage; error?: string };
      if (!res.ok || !data.message) throw new Error(data.error || "Could not send message.");
      return data.message;
    },
    [selectedId],
  );

  async function saveOrder(order: Order) {
    const response = await fetch(`/api/admin/commerce/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        email: order.email,
      }),
    });
    if (!response.ok) {
      setStatus("Failed to update order.");
      return;
    }
    setStatus(
      order.fulfillmentStatus === "FULFILLED" || order.status === "FULFILLED"
        ? `Order ${order.orderNumber} marked fulfilled.`
        : "Order updated.",
    );
    await loadOrders();
    // Close detail modal after a successful status save (e.g. marked fulfilled)
    setSelectedId(null);
  }

  function isPaidOrder(order: Order) {
    return (
      order.paymentStatus === "PAID" ||
      order.paymentStatus === "PARTIALLY_REFUNDED" ||
      order.paymentStatus === "REFUNDED" ||
      Boolean(order.authorizeNetTransId) ||
      (order.payments ?? []).some((p) => p.status === "PAID")
    );
  }

  async function deleteOrder(order: Order) {
    if (isPaidOrder(order)) {
      setStatus(
        `Order ${order.orderNumber} was paid and cannot be deleted. Keep the record — cancel/refund instead if needed.`,
      );
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete the order ${order.orderNumber}?\n\nThis cannot be undone.`,
      )
    ) {
      return;
    }
    const response = await fetch(`/api/admin/commerce/orders/${order.id}`, { method: "DELETE" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setStatus(
      response.ok
        ? `Order ${order.orderNumber} deleted.`
        : payload.error || "Failed to delete order.",
    );
    if (response.ok) {
      if (selectedId === order.id) setSelectedId(null);
      await loadOrders();
    }
  }

  async function addFulfillment(orderId: string, formData: FormData) {
    const body = {
      status: String(formData.get("status") || "PROCESSING"),
      carrier: String(formData.get("carrier") || ""),
      trackingNumber: String(formData.get("trackingNumber") || ""),
      trackingUrl: String(formData.get("trackingUrl") || ""),
      notes: String(formData.get("notes") || ""),
    };
    const response = await fetch(`/api/admin/commerce/orders/${orderId}/fulfillments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Fulfillment added." : "Failed to add fulfillment.");
    if (response.ok) await loadOrders();
  }

  const paidTotal = useMemo(
    () => orders.filter((o) => o.paymentStatus === "PAID").reduce((sum, o) => sum + paymentAmountPaid(o), 0),
    [orders],
  );

  const peptideOrders = useMemo(() => orders.filter((order) => orderIncludesPeptides(order.items)), [orders]);
  const therapyOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.orderNumber.startsWith("KP-THERAPY-") ||
          Boolean(order.therapyProposal) ||
          Boolean(order.intakeSubmission) ||
          order.items?.some((item) => (item.product?.catalogKind || "").toUpperCase() === "CLINICAL"),
      ),
    [orders],
  );
  const visibleOrders = useMemo(() => {
    let list = orders;
    if (catalog === "GLP") list = peptideOrders;
    else if (catalog === "therapy") list = therapyOrders;
    else if (catalog === "shop") {
      list = orders.filter(
        (order) => !orderIncludesPeptides(order.items) && !order.orderNumber.startsWith("KP-THERAPY-"),
      );
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((order) => {
      const hay = [
        order.orderNumber,
        order.email,
        order.phone,
        order.authorizeNetTransId,
        order.distributionOrderId,
        order.rxhereOrderId,
        order.partner?.displayName,
        ...(order.items ?? []).map((i) => i.title),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [catalog, orders, peptideOrders, therapyOrders, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={adminEyebrow}>Commerce</p>
          <h1 className={adminTitle}>Orders</h1>
          <p className={adminMuted}>
            Review line items, payments, and live pharmacy shipping (Wellness Tech → Eventide).
          </p>
        </div>
        <button
          type="button"
          className={adminBtnSoft}
          disabled={syncingDistribution}
          onClick={() => void refreshDistributionStatuses()}
        >
          {syncingDistribution ? "Refreshing…" : "Refresh shipping status"}
        </button>
      </div>

      {status ? <p className="text-sm text-[#1b6568]">{status}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All orders", orders.length],
            ["therapy", "Therapy", therapyOrders.length],
            ["shop", "Shop", null],
            ["GLP", "GLP", peptideOrders.length],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCatalog(value)}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] ${
              catalog === value ? "bg-[#1f1a15] text-white" : "border border-[#e4d9c8] bg-white text-[#4f4335]"
            }`}
          >
            {label}
            {count != null ? ` (${count})` : ""}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order #, email, AuthNet ID…"
          className={`${adminInput} ml-auto min-w-[220px] max-w-sm`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Orders</p>
          <p className="mt-2 font-serif text-3xl">{orders.length}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Therapy / clinical</p>
          <p className="mt-2 font-serif text-3xl">{therapyOrders.length}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Paid revenue</p>
          <p className="mt-2 font-serif text-3xl">{money(paidTotal)}</p>
        </div>
        <div className={`${adminPanel} p-5`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f6f3e]">Unfulfilled</p>
          <p className="mt-2 font-serif text-3xl">
            {orders.filter((o) => o.fulfillmentStatus === "UNFULFILLED" || o.fulfillmentStatus === "PROCESSING").length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleOrders.map((order) => {
          const peptideOrder = orderIncludesPeptides(order.items);
          return (
          <article key={order.id} className={`${adminPanel} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-xl text-[#1f1a15]">
                  {order.orderNumber}
                  {peptideOrder ? (
                    <span className="ml-2 align-middle rounded-full bg-[#fff6e8] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8f6f3e]">GLP</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-[#6f6251]">
                  {order.email ?? "No email"}
                  {order.createdAt ? ` · ${new Date(order.createdAt).toLocaleString()}` : ""}
                </p>
                {order.partner || order.intakeSubmission || order.therapyProposal ? (
                  <p className="mt-1 text-xs text-[#8f6f3e]">
                    {order.therapyProposal ? "Therapy · " : ""}
                    {order.partner ? `Provider ${order.partner.displayName} (${order.partner.partnerCode})` : ""}
                    {order.partner && order.intakeSubmission ? " · " : ""}
                    {order.intakeSubmission
                      ? `Intake ${order.intakeSubmission.publicTrackingToken || order.intakeSubmission.id}`
                      : ""}
                  </p>
                ) : null}
                {order.paymentStatus === "PAID" ? (
                  <p className="mt-1 font-mono text-[11px] text-[#1b6568]">
                    Paid in full {money(paymentAmountPaid(order))}
                    {order.authorizeNetTransId ? ` · ID ${order.authorizeNetTransId}` : ""}
                    {order.payments?.[0]?.provider ? ` · ${order.payments[0].provider}` : ""}
                  </p>
                ) : null}
                {order.distributionOrderId ? (
                  <p className="mt-1 text-xs text-[#1b6568]">
                    Wellness Tech · {order.distributionOrderId}
                    {order.distributionStatus ? ` · ${order.distributionStatus}` : ""}
                    {order.rxhereOrderId ? ` · Eventide ${order.rxhereOrderId}` : ""}
                  </p>
                ) : null}
                {order.distributionSyncError ? (
                  <p className="mt-1 text-xs text-[#8a4b3c]">
                    Pharmacy sync: {order.distributionSyncError}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.paymentStatus === "PAID" &&
                (!order.distributionOrderId || !order.rxhereOrderId || order.distributionSyncError) ? (
                  <button
                    type="button"
                    className={adminBtnSoft}
                    disabled={retryingId === order.id}
                    onClick={() => void retryDistribution(order.id)}
                  >
                    {retryingId === order.id ? "Retrying…" : "Retry pharmacy send"}
                  </button>
                ) : null}
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${statusTone(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(order.items ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-[#fffaf3] px-3 py-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#efe4d4]">
                    {item.product?.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[#1f1a15]">{item.title}</p>
                    <p className="text-xs text-[#6f6251]">
                      Qty {item.quantity} · {money(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm text-[#1f1a15]">{money(item.lineTotal)}</p>
                </div>
              ))}
              {(order.items?.length ?? 0) > 3 ? (
                <p className="text-xs text-[#8f6f3e]">+{(order.items?.length ?? 0) - 3} more items</p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                  {order.paymentStatus === "PAID" ? "Paid in full" : "Order total"}
                </p>
                <p className="font-serif text-2xl text-[#1f1a15]">
                  {money(order.paymentStatus === "PAID" ? paymentAmountPaid(order) : order.total)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={adminBtnPrimary} onClick={() => setSelectedId(order.id)}>
                  View order
                </button>
                {!isPaidOrder(order) ? (
                  <button
                    type="button"
                    className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                    onClick={() => void deleteOrder(order)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </article>
          );
        })}
        {!visibleOrders.length ? (
          <div className={`${adminPanel} p-8 text-sm text-[#6f6251]`}>
            {query.trim()
              ? `No orders match “${query.trim()}”. Try All orders or clear search.`
              : catalog === "GLP"
                ? "No GLP peptide orders yet."
                : catalog === "therapy"
                  ? "No therapy / clinical orders yet."
                  : "No orders yet."}
          </div>
        ) : null}
      </div>

      <AdminModal open={Boolean(selected)} title={selected?.orderNumber ?? "Order"} eyebrow="Order detail" wide onClose={() => setSelectedId(null)}>
        {selected ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Order status</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.status}
                  onChange={(e) =>
                    setOrders((prev) => prev.map((row) => (row.id === selected.id ? { ...row, status: e.target.value } : row)))
                  }
                >
                  {orderStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Payment</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.paymentStatus}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((row) => (row.id === selected.id ? { ...row, paymentStatus: e.target.value } : row)),
                    )
                  }
                >
                  {paymentStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">Fulfillment</span>
                <select
                  className={`${adminSelect} w-full`}
                  value={selected.fulfillmentStatus}
                  onChange={(e) =>
                    setOrders((prev) =>
                      prev.map((row) => (row.id === selected.id ? { ...row, fulfillmentStatus: e.target.value } : row)),
                    )
                  }
                >
                  {fulfillmentStatuses.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <section className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
              <h3 className="font-serif text-lg text-[#1f1a15]">Customer</h3>
              <p className="mt-2 text-sm text-[#2b2218]">{selected.email ?? "—"}</p>
              <p className="text-sm text-[#6f6251]">{selected.phone ?? "No phone"}</p>
              {selected.shippingAddress ? (
                <p className="mt-2 text-sm text-[#6f6251]">
                  {[selected.shippingAddress.line1, selected.shippingAddress.city, selected.shippingAddress.state, selected.shippingAddress.postal]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
            </section>

            {selected.partner || selected.intakeSubmission || selected.therapyProposal ? (
              <section className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4 text-sm">
                <h3 className="font-serif text-lg text-[#1f1a15]">Therapy / clinical</h3>
                {selected.partner ? (
                  <p className="mt-2 text-[#2b2218]">
                    Provider: {selected.partner.displayName} ({selected.partner.partnerCode})
                  </p>
                ) : null}
                {selected.intakeSubmission ? (
                  <p className="mt-1 text-[#6f6251]">
                    Intake: {selected.intakeSubmission.fullName} ·{" "}
                    <span className="font-mono tracking-[0.12em]">
                      {selected.intakeSubmission.publicTrackingToken || selected.intakeSubmission.id}
                    </span>{" "}
                    · {selected.intakeSubmission.status.replaceAll("_", " ")}
                  </p>
                ) : null}
                {selected.therapyProposal ? (
                  <p className="mt-1 text-[#6f6251]">
                    Proposal: {selected.therapyProposal.status}
                    {selected.therapyProposal.notes ? ` — ${selected.therapyProposal.notes}` : ""}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[#8f6f3e]">
                  Ship the therapy products below, then add tracking and mark fulfilled.
                </p>
              </section>
            ) : null}

            <section className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                {selected.paymentStatus === "PAID" ? "Paid in full" : "Order total"}
              </p>
              <p className="mt-1 font-serif text-3xl text-[#1f1a15]">
                {money(selected.paymentStatus === "PAID" ? paymentAmountPaid(selected) : selected.total)}
              </p>
              <p className="mt-2 text-sm text-[#2b2218]">
                Payment status: <strong>{selected.paymentStatus}</strong>
              </p>
              {selected.authorizeNetTransId ? (
                <p className="mt-1 font-mono text-xs text-[#1b6568]">Payment ID: {selected.authorizeNetTransId}</p>
              ) : null}
              {(selected.payments ?? []).map((pay) => (
                <p key={pay.id} className="mt-1 text-xs text-[#6f6251]">
                  {pay.provider} · {pay.status} · {money(pay.amount)}
                  {pay.metadata && typeof pay.metadata === "object" && "transId" in pay.metadata && pay.metadata.transId
                    ? ` · ${String(pay.metadata.transId)}`
                    : ""}
                </p>
              ))}
            </section>

            <section className="space-y-2">
              <h3 className="font-serif text-lg text-[#1f1a15]">Product breakdown</h3>
              {(selected.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#efe4d4] bg-white p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#efe4d4]">
                    {item.product?.featuredImage ? (
                      <Image src={item.product.featuredImage} alt={item.title} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#1f1a15]">{item.title}</p>
                    <p className="text-xs text-[#6f6251]">
                      {item.sku ? `SKU ${item.sku} · ` : ""}Qty {item.quantity} · {money(item.unitPrice)} each
                    </p>
                  </div>
                  <p className="font-medium text-[#1f1a15]">{money(item.lineTotal)}</p>
                </div>
              ))}
              {(selected.items?.length ?? 0) === 0 ? (
                <p className="text-sm text-[#6f6251]">No line items on this order.</p>
              ) : null}
            </section>

            <section className="grid gap-2 rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4 text-sm">
              <div className="flex justify-between"><span>Products subtotal</span><span>{money(orderSubtotal(selected))}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{money(selected.shippingTotal)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{money(selected.taxTotal)}</span></div>
              {Number(selected.discountTotal ?? 0) > 0 ? (
                <div className="flex justify-between"><span>Discount</span><span>-{money(selected.discountTotal)}</span></div>
              ) : null}
              <div className="flex justify-between border-t border-[#e5d7c2] pt-2 font-medium">
                <span>{selected.paymentStatus === "PAID" ? "Paid in full" : "Total"}</span>
                <span>{money(selected.paymentStatus === "PAID" ? paymentAmountPaid(selected) : selected.total)}</span>
              </div>
            </section>

            {(selected.fulfillments?.length ?? 0) > 0 ? (
              <section className="rounded-2xl border border-[#efe4d4] p-4 text-sm">
                <h3 className="font-serif text-lg text-[#1f1a15]">Tracking</h3>
                <ul className="mt-2 space-y-2">
                  {(selected.fulfillments ?? []).map((f) => (
                    <li key={f.id} className="text-[#2b2218]">
                      {f.status}
                      {f.carrier ? ` · ${f.carrier}` : ""}
                      {f.trackingNumber ? ` · ${f.trackingNumber}` : ""}
                      {f.trackingUrl ? (
                        <>
                          {" · "}
                          <a href={f.trackingUrl} className="text-[#8f6f3e] underline" target="_blank" rel="noreferrer">
                            Track
                          </a>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <form
              className="grid gap-2 rounded-2xl border border-[#efe4d4] p-4 md:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                void addFulfillment(selected.id, new FormData(event.currentTarget));
              }}
            >
              <h3 className="font-serif text-lg text-[#1f1a15] md:col-span-2">Add fulfillment</h3>
              <select name="status" defaultValue="PROCESSING" className={adminSelect}>
                {fulfillmentStatuses.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
              <input name="carrier" placeholder="Carrier" className={adminInput} />
              <input name="trackingNumber" placeholder="Tracking number" className={adminInput} />
              <input name="trackingUrl" placeholder="Tracking URL" className={adminInput} />
              <input name="notes" placeholder="Notes" className={`${adminInput} md:col-span-2`} />
              <button className={`${adminBtnPrimary} md:col-span-2`}>Save fulfillment</button>
            </form>

            <OrderMessageThread
              reloadKey={selected.id}
              selfRole="ADMIN"
              title="Customer messages"
              hint="Reply to the member about this order. They see updates live in My Orders."
              placeholder="Reply to the customer…"
              submitLabel="Send reply"
              loadMessages={loadOrderMessages}
              sendMessage={sendOrderMessage}
            />

            <div className="flex flex-wrap gap-2">
              <button type="button" className={adminBtnPrimary} onClick={() => void saveOrder(selected)}>
                Save status changes
              </button>
              <button type="button" className={adminBtnGhost} onClick={() => setSelectedId(null)}>
                Close
              </button>
              {!isPaidOrder(selected) ? (
                <button
                  type="button"
                  className="rounded-sm border border-[#d07b7b80] px-4 py-2 text-sm text-[#7c2c2c] hover:bg-[#fdeeee]"
                  onClick={() => void deleteOrder(selected)}
                >
                  Delete order
                </button>
              ) : (
                <p className="text-xs text-[#6f6251]">Paid orders cannot be deleted.</p>
              )}
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
