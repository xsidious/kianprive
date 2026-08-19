"use client";

import Link from "next/link";

export type PaymentReceiptData = {
  orderNumber: string;
  amount: number;
  transId?: string | null;
  paidAt?: string | Date | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  testMode?: boolean;
  patientName?: string | null;
};

function formatPaidAt(value?: string | Date | null) {
  if (!value) return new Date().toLocaleString();
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PaymentReceipt({ receipt }: { receipt: PaymentReceiptData }) {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="text-center">
        <div className="animate-success-ring mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e8f5ea] ring-4 ring-[#cfe6d3]/80">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              className="animate-success-check"
              d="M6 12.5l3.5 3.5L18 8"
              stroke="#2f6b3a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-4 font-serif text-2xl text-[#1f1a15]">Payment successful</h2>
        <p className="mt-1 text-sm text-[#6f6251]">
          {receipt.testMode ? "Test payment recorded — no real charge." : "Thank you. Your transaction is complete."}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[#e7dcc8] bg-white shadow-[0_8px_30px_rgba(31,26,21,0.06)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8f6f3e] via-[#b78d4b] to-[#8f6f3e]" />
        <div className="border-b border-dashed border-[#e7dcc8] px-6 py-5 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Transaction receipt</p>
          <p className="mt-2 font-serif text-3xl text-[#1f1a15]">${receipt.amount.toFixed(2)}</p>
          {receipt.patientName ? (
            <p className="mt-1 text-sm text-[#6f6251]">{receipt.patientName}</p>
          ) : null}
        </div>

        <dl className="divide-y divide-[#f3ebe0] px-6 py-2 text-sm">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[#6f6251]">Order</dt>
            <dd className="font-mono text-[13px] text-[#1f1a15]">{receipt.orderNumber}</dd>
          </div>
          {receipt.transId ? (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-[#6f6251]">Transaction ID</dt>
              <dd className="max-w-[58%] truncate font-mono text-[12px] text-[#1f1a15]" title={receipt.transId}>
                {receipt.transId}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[#6f6251]">Date</dt>
            <dd className="text-[#1f1a15]">{formatPaidAt(receipt.paidAt)}</dd>
          </div>
          {receipt.cardLast4 ? (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-[#6f6251]">Payment method</dt>
              <dd className="text-[#1f1a15]">
                {receipt.cardBrand ? `${receipt.cardBrand} · ` : ""}•••• {receipt.cardLast4}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[#6f6251]">Status</dt>
            <dd className="rounded-full bg-[#eef6ef] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#2f6b3a]">
              Paid
            </dd>
          </div>
        </dl>

        <div className="border-t border-dashed border-[#e7dcc8] bg-[#fffaf3] px-6 py-4 text-center text-xs text-[#8a7d6c]">
          A confirmation email has been sent. Our care team will begin fulfillment.
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/track-intake"
          className="rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-5 py-2.5 text-sm text-white"
        >
          Track my intake
        </Link>
        <Link href="/dashboard/intake" className="rounded-full border border-[#d8cbb5] px-5 py-2.5 text-sm text-[#6f6251]">
          Member dashboard
        </Link>
      </div>
    </div>
  );
}
