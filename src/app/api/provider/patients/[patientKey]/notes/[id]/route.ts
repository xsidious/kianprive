import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { requireProviderPatientAccess } from "@/lib/provider/patient-access";
import { writeAuditLog } from "@/lib/partners";

type Params = { params: Promise<{ patientKey: string; id: string }> };

const patchSchema = z.object({
  body: z.string().min(1).max(20000).optional(),
  archive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey, id } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const existing = await prisma.patientChartNote.findFirst({
    where: { id, patientEmail: gate.email, archivedAt: null },
  });
  if (!existing) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  if (
    existing.visibility === "CLINICAL" &&
    existing.authorPartnerId &&
    existing.authorPartnerId !== access.partner.id
  ) {
    return NextResponse.json(
      { error: "You can only edit clinical notes you authored." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const note = await prisma.patientChartNote.update({
    where: { id: existing.id },
    data: {
      ...(parsed.data.body !== undefined ? { body: parsed.data.body.trim() } : {}),
      ...(parsed.data.archive ? { archivedAt: new Date() } : {}),
    },
  });

  await writeAuditLog({
    userId: access.userId,
    action: parsed.data.archive ? "provider.patient.notes.archive" : "provider.patient.notes.update",
    entityType: "PatientChartNote",
    entityId: note.id,
    metadata: { partnerId: access.partner.id },
  });

  return NextResponse.json({ note });
}
