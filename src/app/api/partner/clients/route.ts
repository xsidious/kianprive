import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  const partnerId = access.partner.id;

  const [bookings, orders] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { partnerId },
      select: {
        fullName: true,
        email: true,
        phone: true,
        scheduledStart: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.order.findMany({
      where: { partnerId },
      select: {
        email: true,
        phone: true,
        createdAt: true,
        paymentStatus: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
  ]);

  type Client = {
    name: string;
    email: string;
    phone: string;
    lastVisit: string;
    visits: number;
    sources: string[];
  };

  const map = new Map<string, Client>();

  for (const b of bookings) {
    const email = b.email.toLowerCase();
    const visit = (b.scheduledStart ?? b.createdAt).toISOString();
    const existing = map.get(email);
    if (!existing) {
      map.set(email, {
        name: b.fullName,
        email: b.email,
        phone: b.phone,
        lastVisit: visit,
        visits: 1,
        sources: ["booking"],
      });
    } else {
      existing.visits += 1;
      if (!existing.sources.includes("booking")) existing.sources.push("booking");
      if (new Date(visit) > new Date(existing.lastVisit)) {
        existing.lastVisit = visit;
        existing.name = b.fullName;
        if (b.phone) existing.phone = b.phone;
      }
    }
  }

  for (const o of orders) {
    if (!o.email) continue;
    const email = o.email.toLowerCase();
    const visit = o.createdAt.toISOString();
    const addr = o.shippingAddress as { firstName?: string; lastName?: string } | null;
    const name = [addr?.firstName, addr?.lastName].filter(Boolean).join(" ") || o.email;
    const existing = map.get(email);
    if (!existing) {
      map.set(email, {
        name,
        email: o.email,
        phone: o.phone ?? "",
        lastVisit: visit,
        visits: 1,
        sources: ["order"],
      });
    } else {
      existing.visits += 1;
      if (!existing.sources.includes("order")) existing.sources.push("order");
      if (new Date(visit) > new Date(existing.lastVisit)) existing.lastVisit = visit;
      if (o.phone && !existing.phone) existing.phone = o.phone;
    }
  }

  const clients = [...map.values()].sort(
    (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime(),
  );

  return NextResponse.json({ clients });
}
