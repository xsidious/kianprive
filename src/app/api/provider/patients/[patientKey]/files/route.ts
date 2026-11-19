import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { PatientFileVisibility } from "@prisma/client";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import {
  requireProviderPatientAccess,
  resolvePatientUserId,
} from "@/lib/provider/patient-access";
import { writeAuditLog } from "@/lib/partners";
import { splitBookingNotes } from "@/lib/admin/booking-display";

type Params = { params: Promise<{ patientKey: string }> };

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export async function GET(_req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const [files, intakes, bookings] = await Promise.all([
    prisma.patientFile.findMany({
      where: { patientEmail: gate.email, archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.therapeuticsIntakeSubmission.findMany({
      where: {
        assignedPartnerId: access.partner.id,
        email: { equals: gate.email, mode: "insensitive" },
      },
      select: {
        id: true,
        createdAt: true,
        clientSignatureDataUrl: true,
        providerSignatureDataUrl: true,
      },
      take: 50,
    }),
    prisma.bookingRequest.findMany({
      where: {
        partnerId: access.partner.id,
        email: { equals: gate.email, mode: "insensitive" },
      },
      select: { id: true, notes: true, createdAt: true },
      take: 50,
    }),
  ]);

  const legacy: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    url: string;
    visibility: "CLINICAL";
    legacy: true;
    createdAt: string;
  }> = [];

  for (const intake of intakes) {
    if (intake.clientSignatureDataUrl?.startsWith("data:image")) {
      legacy.push({
        id: `legacy-intake-client-${intake.id}`,
        fileName: "Client signature (intake)",
        mimeType: "image/*",
        url: intake.clientSignatureDataUrl,
        visibility: "CLINICAL",
        legacy: true,
        createdAt: intake.createdAt.toISOString(),
      });
    }
    if (intake.providerSignatureDataUrl?.startsWith("data:image")) {
      legacy.push({
        id: `legacy-intake-provider-${intake.id}`,
        fileName: "Provider signature (intake)",
        mimeType: "image/*",
        url: intake.providerSignatureDataUrl,
        visibility: "CLINICAL",
        legacy: true,
        createdAt: intake.createdAt.toISOString(),
      });
    }
  }

  for (const booking of bookings) {
    const { signatures } = splitBookingNotes(booking.notes);
    signatures.forEach((sig, idx) => {
      legacy.push({
        id: `legacy-booking-${booking.id}-${idx}`,
        fileName: `${sig.label} (booking)`,
        mimeType: "image/*",
        url: sig.src,
        visibility: "CLINICAL",
        legacy: true,
        createdAt: booking.createdAt.toISOString(),
      });
    });
  }

  await writeAuditLog({
    userId: access.userId,
    action: "provider.patient.files.read",
    entityType: "PatientFile",
    entityId: gate.email,
    metadata: { partnerId: access.partner.id },
  });

  return NextResponse.json({
    files: files.map((f) => ({ ...f, legacy: false })),
    legacy,
  });
}

export async function POST(req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;

  const { patientKey } = await params;
  const gate = await requireProviderPatientAccess(access.partner, patientKey);
  if (!gate.ok) return gate.response;

  const form = await req.formData();
  const file = form.get("file");
  const visibilityRaw = String(form.get("visibility") || "CLINICAL").toUpperCase();
  const visibility: PatientFileVisibility =
    visibilityRaw === "CLIENT" ? "CLIENT" : "CLINICAL";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 8MB." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, or PDF files are allowed." },
      { status: 400 },
    );
  }

  const patientUserId = await resolvePatientUserId(gate.email);
  const safeName = (file.name || "upload").replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const pathname = `patient-files/${gate.email.replace(/[^a-z0-9@._-]/gi, "_")}/${Date.now()}-${safeName}`;

  let url = "";
  let storageKey: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    url = blob.url;
    storageKey = blob.pathname;
  } else if (file.type.startsWith("image/") && file.size <= 900_000) {
    const buffer = Buffer.from(await file.arrayBuffer());
    url = `data:${file.type};base64,${buffer.toString("base64")}`;
  } else {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not configured. Small images under 900KB can still be stored; larger/PDF files require Blob.",
      },
      { status: 503 },
    );
  }

  const row = await prisma.patientFile.create({
    data: {
      patientEmail: gate.email,
      patientUserId,
      visibility,
      fileName: safeName,
      mimeType: file.type,
      url,
      storageKey,
      partnerId: access.partner.id,
      uploadedByUserId: access.userId,
    },
  });

  await writeAuditLog({
    userId: access.userId,
    action: "provider.patient.files.create",
    entityType: "PatientFile",
    entityId: row.id,
    metadata: {
      partnerId: access.partner.id,
      visibility,
      mimeType: file.type,
      patientEmail: gate.email,
    },
  });

  return NextResponse.json({ file: row }, { status: 201 });
}
