import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

function secretOk(header: string | null) {
  const expected =
    process.env.WT_PARTNER_ORDER_SECRET?.trim() ||
    process.env.KIAN_PARTNER_SECRET?.trim() ||
    "";
  if (!expected || !header) return false;
  const left = Buffer.from(header);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Wellness Tech Connected Sites poller — aggregate non-PHI ops metrics. */
export async function GET(request: Request) {
  if (!secretOk(request.headers.get("x-wt-partner-secret"))) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    usersTotal,
    roleGroups,
    partnersActive,
    ordersTotal,
    orders30d,
    intakesTotal,
    intakesOpen,
    bookings30d,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.partnerProfile.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.therapeuticsIntakeSubmission.count(),
    prisma.therapeuticsIntakeSubmission.count({
      where: {
        status: {
          in: ["PENDING_REVIEW", "UNDER_PHYSICIAN_REVIEW", "NEEDS_LABS", "NEEDS_FOLLOW_UP"],
        },
      },
    }),
    prisma.bookingRequest.count({ where: { createdAt: { gte: since } } }).catch(() => 0),
  ]);

  const usersByRole: Record<string, number> = {};
  for (const row of roleGroups) {
    usersByRole[String(row.role)] = row._count._all;
  }

  return NextResponse.json({
    ok: true,
    site: "kian-prive",
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    fetchedAt: new Date().toISOString(),
    usersTotal,
    usersByRole,
    partnersActive,
    ordersTotal,
    orders30d,
    intakesTotal,
    intakesOpen,
    bookings30d,
  });
}
