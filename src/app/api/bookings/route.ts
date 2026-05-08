import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";

const createBookingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  preferredDate: z.string().min(1),
  preferredLocation: z.string().min(1),
  notes: z.string().optional(),
  serviceIds: z.array(z.string().min(1)).min(1),
  serviceTitles: z.array(z.string().min(1)).min(1),
  guestTotal: z.number().nonnegative(),
  memberTotal: z.number().nonnegative(),
});

export async function POST(req: Request) {
  const session = await auth();
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  }

  const preferredDate = new Date(parsed.data.preferredDate);
  if (Number.isNaN(preferredDate.getTime())) {
    return NextResponse.json({ error: "Preferred date is invalid." }, { status: 400 });
  }

  const booking = await prisma.bookingRequest.create({
    data: {
      userId: session?.user?.id || null,
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      preferredDate,
      preferredLocation: parsed.data.preferredLocation,
      notes: parsed.data.notes || null,
      serviceIds: parsed.data.serviceIds,
      serviceTitles: parsed.data.serviceTitles,
      guestTotal: parsed.data.guestTotal,
      memberTotal: parsed.data.memberTotal,
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, booking });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      preferredDate: true,
      preferredLocation: true,
      serviceTitles: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({ bookings });
}
