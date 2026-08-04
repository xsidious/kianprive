import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAccess } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdminAccess();
  if (!guard.ok) return guard.response;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              featuredImage: true,
              slug: true,
              title: true,
              catalogKind: true,
              category: true,
            },
          },
        },
      },
      fulfillments: true,
      payments: true,
      refunds: true,
      partner: { select: { displayName: true, partnerCode: true, type: true } },
      intakeSubmission: {
        select: {
          id: true,
          fullName: true,
          email: true,
          publicTrackingToken: true,
          status: true,
        },
      },
      therapyProposal: {
        select: {
          id: true,
          status: true,
          notes: true,
        },
      },
    },
  });
  return NextResponse.json({ orders });
}
