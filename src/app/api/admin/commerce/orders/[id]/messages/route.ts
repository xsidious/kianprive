import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";
import { createOrderMessage, listOrderMessages } from "@/lib/orders/messages";

type Params = { params: Promise<{ id: string }> };

const postSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export async function GET(_: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const messages = await listOrderMessages(order.id);
  return NextResponse.json({ ok: true, orderId: order.id, messages });
}

export async function POST(req: Request, { params }: Params) {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: guard.userId },
    select: { name: true, email: true },
  });

  const message = await createOrderMessage({
    orderId: order.id,
    authorRole: "ADMIN",
    body: parsed.data.body,
    authorUserId: guard.userId,
    authorName: admin?.name || admin?.email || "KIAN Privé team",
    notifyCustomer: true,
  });

  return NextResponse.json({ ok: true, message });
}
