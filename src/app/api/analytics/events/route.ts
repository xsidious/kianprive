import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    body.country ||
    null;
  const city = req.headers.get("x-vercel-ip-city") || body.city || null;
  const region = req.headers.get("x-vercel-ip-country-region") || body.region || null;

  try {
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
        country: country ? String(country).toUpperCase() : null,
        city: city ? decodeURIComponent(String(city)) : null,
        region: region ? String(region) : null,
        metadata: {
          ...(body.metadata ?? {}),
          locale: body.locale ?? null,
          timezone: body.timezone ?? null,
        },
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : undefined,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch {
    // Never block page loads when analytics schema is behind app deploys.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
