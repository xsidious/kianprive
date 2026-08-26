"use client";

import Image from "next/image";
import { TherapyOrderSummary } from "@/components/commerce/TherapyOrderSummary";
import { TherapyAcceptPay } from "@/components/intake/TherapyAcceptPay";
import type { PaymentReceiptData } from "@/components/commerce/PaymentReceipt";

type LineItem = {
  id: string;
  title: string;
  quantity: number;
  lineTotal: number;
};

type Props = {
  token: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  shippingTotal?: number;
  notes?: string | null;
  patientName?: string | null;
  items: LineItem[];
  paid: boolean;
  expired: boolean;
  receipt?: PaymentReceiptData | null;
};

export function InvoicePayExperience({
  token,
  orderNumber,
  total,
  subtotal,
  shippingTotal,
  notes,
  patientName,
  items,
  paid,
  expired,
  receipt,
}: Props) {
  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <div className="animate-fade-up mb-8 text-center">
        <Image
          src="/images/kian-prive-logo.png"
          alt="KIAN Privé"
          width={160}
          height={48}
          className="mx-auto h-10 w-auto"
          unoptimized
        />
        <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">Invoice payment</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">{orderNumber}</h1>
        {patientName ? <p className="mt-2 text-sm text-[#6f6251]">Prepared for {patientName}</p> : null}
      </div>

      {!paid && !expired ? (
        <>
          <TherapyOrderSummary
            className="animate-fade-up mb-6"
            items={items}
            subtotal={subtotal}
            shippingTotal={shippingTotal}
            total={total}
          />
          {notes ? (
            <p className="animate-fade-up mb-6 rounded-xl bg-[#fffaf3] px-3 py-2.5 text-sm leading-relaxed text-[#6f6251]">
              {notes}
            </p>
          ) : null}
        </>
      ) : null}

      {expired ? (
        <div className="rounded-2xl border border-[#f0d4d4] bg-[#fff6f6] p-6 text-center text-sm text-[#7c2c2c]">
          This payment link has expired. Ask your KIAN Privé care team to send a new invoice.
        </div>
      ) : paid || receipt ? (
        <TherapyAcceptPay
          orderId={token}
          total={total}
          orderNumber={orderNumber}
          endpoint={`/api/pay/${token}`}
          buttonLabel="Pay invoice"
          patientName={patientName}
          initialReceipt={
            receipt ?? {
              orderNumber,
              amount: total,
              patientName,
              paidAt: new Date().toISOString(),
            }
          }
        />
      ) : (
        <TherapyAcceptPay
          orderId={token}
          total={total}
          orderNumber={orderNumber}
          endpoint={`/api/pay/${token}`}
          buttonLabel="Pay invoice"
          patientName={patientName}
        />
      )}
    </main>
  );
}
