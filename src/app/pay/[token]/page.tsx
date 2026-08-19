import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isPaymentTokenValid } from "@/lib/commerce/payment-link";
import { InvoicePayClient } from "@/components/commerce/InvoicePayClient";
import { buildSeoMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ token: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: "Pay invoice",
    description: "Secure KIAN Privé invoice payment.",
    canonicalPath: "/pay",
    noIndex: true,
  });
}

export default async function PayInvoicePage({ params }: Props) {
  const { token } = await params;
  const order = await prisma.order.findUnique({
    where: { paymentToken: token },
    select: {
      orderNumber: true,
      notes: true,
      total: true,
      paymentStatus: true,
      paymentTokenExpiresAt: true,
      items: { select: { id: true, title: true, quantity: true, unitPrice: true, lineTotal: true } },
      intakeSubmission: { select: { fullName: true } },
    },
  });
  if (!order) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">KIAN Privé</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">Payment link not found</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6f6251]">
          This link may be expired, already used, or copied incorrectly. Ask your KIAN Privé care team to resend your
          therapy invoice, or track your intake with the email and request code from your confirmation.
        </p>
        <Link
          href="/track-intake"
          className="mt-6 inline-flex rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-5 py-2.5 text-sm text-white"
        >
          Track my intake
        </Link>
      </main>
    );
  }

  const expired = !isPaymentTokenValid(order) && order.paymentStatus !== "PAID";
  const paid = order.paymentStatus === "PAID";

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#8f6f3e]">KIAN Privé</p>
      <h1 className="mt-2 font-serif text-3xl text-[#1f1a15]">Invoice {order.orderNumber}</h1>
      {order.intakeSubmission?.fullName ? (
        <p className="mt-2 text-sm text-[#6f6251]">Prepared for {order.intakeSubmission.fullName}</p>
      ) : null}

      <ul className="mt-8 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 border-b border-[#efe4d4] pb-3 text-sm">
            <span>
              {item.title} <span className="text-[#8f6f3e]">× {item.quantity}</span>
            </span>
            <span>${Number(item.lineTotal).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex justify-between font-serif text-2xl text-[#1f1a15]">
        <span>Total</span>
        <span>${Number(order.total).toFixed(2)}</span>
      </p>
      {order.notes ? <p className="mt-4 text-sm text-[#6f6251]">{order.notes}</p> : null}

      {paid ? (
        <p className="mt-8 rounded-sm border border-[#cfe6d3] bg-[#f3fbf4] p-4 text-sm text-[#2f6b3a]">
          This invoice is paid. Thank you.
        </p>
      ) : expired ? (
        <p className="mt-8 rounded-sm border border-[#f0d4d4] bg-[#fff6f6] p-4 text-sm text-[#7c2c2c]">
          This payment link has expired. Ask your KIAN Privé care team to send a new invoice.
        </p>
      ) : (
        <div className="mt-8">
          <InvoicePayClient token={token} total={Number(order.total)} orderNumber={order.orderNumber} />
        </div>
      )}
    </main>
  );
}
