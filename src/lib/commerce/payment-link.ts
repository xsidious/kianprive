import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { publicAppBaseUrl } from "@/lib/intake/tracking";

const PAYMENT_LINK_DAYS = 30;

export function orderPaymentUrl(token: string) {
  return `${publicAppBaseUrl()}/pay/${encodeURIComponent(token)}`;
}

export async function issueOrderPaymentToken(orderId: string, opts?: { force?: boolean }) {
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      total: true,
      paymentStatus: true,
      paymentToken: true,
      paymentTokenExpiresAt: true,
    },
  });
  if (!current) {
    throw new Error("Order not found.");
  }

  if (
    !opts?.force &&
    current.paymentToken &&
    current.paymentStatus !== "PAID" &&
    isPaymentTokenValid(current)
  ) {
    return {
      ...current,
      paymentUrl: orderPaymentUrl(current.paymentToken),
    };
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + PAYMENT_LINK_DAYS * 24 * 60 * 60 * 1000);
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentToken: token,
      paymentTokenExpiresAt: expiresAt,
    },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      total: true,
      paymentToken: true,
      paymentTokenExpiresAt: true,
    },
  });
  return {
    ...order,
    paymentUrl: orderPaymentUrl(token),
  };
}

export function isPaymentTokenValid(order: {
  paymentStatus: string;
  paymentTokenExpiresAt: Date | null;
}) {
  if (order.paymentStatus === "PAID") return true;
  if (!order.paymentTokenExpiresAt) return false;
  return order.paymentTokenExpiresAt.getTime() > Date.now();
}
