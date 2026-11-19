import { NextResponse } from "next/server";
import { ChartNoteVisibility } from "@prisma/client";
import { z } from "zod";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import {
  requireProviderPatientAccess,
  resolvePatientUserId,
} from "@/lib/provider/patient-access";
import { writeAuditLog } from "@/lib/partners";

type Params = { params: Promise<{ patientKey: string }> };

const createSchema = z.object({
  visibility: z.enum(["CLINICAL", "CLIENT"]),
  body: z.string().min(1).max(20000),
  intakeSubmissionId: z.string().optional(),
  bookingId: z.string().optional(),
});

export async function GET(req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const url = new URL(req.url);
  const visibility = url.searchParams.get("visibility");
  const whereVisibility =
    visibility === "CLINICAL" || visibility === "CLIENT"
      ? (visibility as ChartNoteVisibility)
      : undefined;

  const notes = await prisma.patientChartNote.findMany({
    where: {
      patientEmail: gate.email,
      archivedAt: null,
      ...(whereVisibility ? { visibility: whereVisibility } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  await writeAuditLog({
    userId: access.userId,
    action: "provider.patient.notes.read",
    entityType: "PatientChartNote",
    entityId: gate.email,
    metadata: { partnerId: access.partner.id, visibility: whereVisibility ?? "ALL" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note." }, { status: 400 });
  }

  const patientUserId = await resolvePatientUserId(gate.email);
  const note = await prisma.patientChartNote.create({
    data: {
      patientEmail: gate.email,
      patientUserId,
      visibility: parsed.data.visibility,
      body: parsed.data.body.trim(),
      intakeSubmissionId: parsed.data.intakeSubmissionId || null,
      bookingId: parsed.data.bookingId || null,
      authorUserId: access.userId,
      authorPartnerId: access.partner.id,
    },
  });

  await writeAuditLog({
    userId: access.userId,
    action: "provider.patient.notes.create",
    entityType: "PatientChartNote",
    entityId: note.id,
    metadata: {
      partnerId: access.partner.id,
      visibility: note.visibility,
      patientEmail: gate.email,
    },
  });

  return NextResponse.json({ note }, { status: 201 });
}
