import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/partners";

/** Member-facing: CLIENT chart notes only. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.trim().toLowerCase();
  const notes = await prisma.patientChartNote.findMany({
    where: {
      visibility: "CLIENT",
      archivedAt: null,
      OR: [
        { patientUserId: session.user.id },
        { patientEmail: { equals: email, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      body: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "member.chart.notes.read",
    entityType: "PatientChartNote",
    entityId: email,
  });

  return NextResponse.json({ notes });
}
