import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isPaymentTokenValid } from "@/lib/commerce/payment-link";
import { InvoicePayExperience } from "@/components/commerce/InvoicePayExperience";
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
      subtotal: true,
      shippingTotal: true,
      total: true,
      paymentStatus: true,
      paymentTokenExpiresAt: true,
      authorizeNetTransId: true,
      updatedAt: true,
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
    <InvoicePayExperience
      token={token}
      orderNumber={order.orderNumber}
      total={Number(order.total)}
      subtotal={Number(order.subtotal)}
      shippingTotal={Number(order.shippingTotal)}
      notes={order.notes}
      patientName={order.intakeSubmission?.fullName}
      items={order.items.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      }))}
      paid={paid}
      expired={expired}
      receipt={
        paid
          ? {
              orderNumber: order.orderNumber,
              amount: Number(order.total),
              transId: order.authorizeNetTransId,
              paidAt: order.updatedAt.toISOString(),
              patientName: order.intakeSubmission?.fullName,
            }
          : null
      }
    />
  );
}
