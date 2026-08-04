import type { OrderMessage, OrderMessageAuthor } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";

export type PublicOrderMessage = {
  id: string;
  authorRole: OrderMessageAuthor;
  authorLabel: string;
  body: string;
  createdAt: string;
};

export function serializeOrderMessage(row: OrderMessage): PublicOrderMessage {
  const authorLabel =
    row.authorRole === "ADMIN"
      ? row.authorName?.trim() || "KIAN Privé team"
      : row.authorRole === "CUSTOMER"
        ? row.authorName?.trim() || "You"
        : "System";

  return {
    id: row.id,
    authorRole: row.authorRole,
    authorLabel,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listOrderMessages(orderId: string) {
  const rows = await prisma.orderMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return rows.map(serializeOrderMessage);
}

export async function createOrderMessage(opts: {
  orderId: string;
  authorRole: OrderMessageAuthor;
  body: string;
  authorUserId?: string | null;
  authorName?: string | null;
  notifyAdmin?: boolean;
  notifyCustomer?: boolean;
}) {
  const body = opts.body.trim();
  if (!body) throw new Error("Message body is required.");

  const message = await prisma.orderMessage.create({
    data: {
      orderId: opts.orderId,
      authorRole: opts.authorRole,
      authorUserId: opts.authorUserId ?? null,
      authorName: opts.authorName?.trim() || null,
      body,
    },
  });

  const order = await prisma.order.findUnique({
    where: { id: opts.orderId },
    select: {
      orderNumber: true,
      email: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (order) {
    const safeBody = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    if (opts.notifyAdmin && opts.authorRole === "CUSTOMER") {
      const adminTo = process.env.BOOKING_REPORT_EMAIL || process.env.PEPTIDE_INTAKE_REPORT_EMAIL;
      if (adminTo) {
        try {
          await sendTransactionalEmail({
            to: adminTo,
            subject: `[Order message] ${order.orderNumber}`,
            text: `Customer message on order ${order.orderNumber}:\n\n${body}\n\nReply in Admin → Orders.`,
            html: `<p>Customer message on order <strong>${order.orderNumber}</strong>:</p><blockquote style="border-left:3px solid #c4a574;padding-left:12px">${safeBody}</blockquote><p>Reply in Admin → Orders.</p>`,
            replyTo: order.email || order.user?.email || undefined,
          });
        } catch (err) {
          console.error("[order/messages] admin notify failed:", err);
        }
      }
    }

    if (opts.notifyCustomer && opts.authorRole === "ADMIN") {
      const to = order.email || order.user?.email;
      if (to) {
        try {
          await sendTransactionalEmail({
            to,
            subject: `Update on your order ${order.orderNumber}`,
            text: `Hi${order.user?.name ? ` ${order.user.name}` : ""},\n\nThere's a new message on your order ${order.orderNumber}:\n\n${body}\n\nView it in your member dashboard → My Orders.\n\n— KIAN Privé`,
            html: `<p>Hi${order.user?.name ? ` ${order.user.name}` : ""},</p><p>There's a new message on your order <strong>${order.orderNumber}</strong>:</p><blockquote style="border-left:3px solid #c4a574;padding-left:12px">${safeBody}</blockquote><p><a href="${process.env.NEXTAUTH_URL || "https://www.kianprive.com"}/dashboard/orders">View your orders</a></p><p>— KIAN Privé</p>`,
          });
        } catch (err) {
          console.error("[order/messages] customer notify failed:", err);
        }
      }
    }
  }

  return serializeOrderMessage(message);
}
