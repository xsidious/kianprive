import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderMessage, listOrderMessages } from "@/lib/orders/messages";

type Params = { params: Promise<{ id: string }> };

const postSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

async function ownedOrder(userId: string, email: string | null | undefined, id: string) {
  return prisma.order.findFirst({
    where: {
      id,
      OR: [
        { userId },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    select: { id: true, userId: true, orderNumber: true },
  });
}

export async function GET(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await ownedOrder(session.user.id, session.user.email, id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const messages = await listOrderMessages(order.id);
  return NextResponse.json({ ok: true, orderId: order.id, messages });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const order = await ownedOrder(session.user.id, session.user.email, id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (!order.userId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { userId: session.user.id },
    });
  }

  const message = await createOrderMessage({
    orderId: order.id,
    authorRole: "CUSTOMER",
    body: parsed.data.body,
    authorUserId: session.user.id,
    authorName: session.user.name || session.user.email || "Member",
    notifyAdmin: true,
  });

  return NextResponse.json({ ok: true, message });
}
