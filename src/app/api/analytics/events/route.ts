import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const event = await prisma.analyticsEvent.create({
    data: {
      eventName: body.eventName ?? "page_view",
      pagePath: body.pagePath,
      referrer: body.referrer,
      source: body.source,
      medium: body.medium,
      campaign: body.campaign,
      userId: body.userId,
      sessionId: body.sessionId,
      orderId: body.orderId,
      metadata: body.metadata ?? {},
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
