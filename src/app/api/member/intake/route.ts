import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientFacingIntakeStatus } from "@/lib/intake/tracking";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email?.toLowerCase();
  const submissions = await prisma.therapeuticsIntakeSubmission.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      fullName: true,
      email: true,
      status: true,
      statusNote: true,
      publicTrackingToken: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  // Soft-link unmatched email intakes to this member for next time
  if (email) {
    await prisma.therapeuticsIntakeSubmission.updateMany({
      where: {
        email: { equals: email, mode: "insensitive" },
        userId: null,
      },
      data: { userId: session.user.id },
    });
  }

  return NextResponse.json({
    intakes: submissions.map((row) => ({
      referenceId: row.id,
      fullName: row.fullName,
      email: row.email,
      status: row.status,
      statusLabel: patientFacingIntakeStatus(row.status),
      statusNote: row.statusNote,
      trackingToken: row.publicTrackingToken,
      submittedAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      orders: row.orders.map((order) => ({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
      })),
    })),
  });
}
