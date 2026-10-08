import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { buildIntakePdf } from "@/lib/intake/intake-pdf";
import { sendTransactionalEmail } from "@/lib/email";
import { accessForPartner } from "@/lib/ehr/locations";
import { intakeVisibleWhere } from "@/lib/ehr/route-intake";

type Params = { params: Promise<{ id: string }> };

function chartFor(access: { partner: { displayName: string; partnerCode: string }; session: { user?: { email?: string | null } } | null }) {
  return accessForPartner({
    displayName: access.partner.displayName,
    partnerCode: access.partner.partnerCode,
    email: access.session?.user?.email,
  });
}

async function loadOwnedSubmission(partnerId: string, locationIds: string[], id: string) {
  return prisma.therapeuticsIntakeSubmission.findFirst({
    where: { id, ...intakeVisibleWhere(partnerId, locationIds) },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const chart = chartFor(access);
  const { id } = await params;
  const submission = await loadOwnedSubmission(access.partner.id, chart.locationIds, id);
  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Only a prescriber claims an unassigned chart so an administrator cannot take the case.
  if (!submission.assignedPartnerId && chart.canPrescribe) {
    await prisma.therapeuticsIntakeSubmission.update({
      where: { id },
      data: { assignedPartnerId: access.partner.id },
    });
  }

  return NextResponse.json({ submission, canPrescribe: chart.canPrescribe });
}

const patchSchema = z.object({
  action: z.enum(["sign", "email-client"]),
  providerSignatureDataUrl: z.string().min(40).max(900_000).optional(),
  providerSignedName: z.string().min(2).max(120).optional(),
  status: z
    .enum([
      "PENDING_REVIEW",
      "UNDER_PHYSICIAN_REVIEW",
      "NEEDS_LABS",
      "APPROVED",
      "NEEDS_FOLLOW_UP",
      "DECLINED",
    ])
    .optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const access = await requirePartnerProfile("practitioner");
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const chart = chartFor(access);
  if (!chart.canPrescribe) {
    return NextResponse.json(
      { error: "Only a medical director or supervising physician can sign or prescribe." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const submission = await loadOwnedSubmission(access.partner.id, chart.locationIds, id);
  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (parsed.data.action === "sign") {
    if (!parsed.data.providerSignatureDataUrl) {
      return NextResponse.json({ error: "Signature required." }, { status: 400 });
    }
    const updated = await prisma.therapeuticsIntakeSubmission.update({
      where: { id },
      data: {
        assignedPartnerId: submission.assignedPartnerId ?? access.partner.id,
        providerSignatureDataUrl: parsed.data.providerSignatureDataUrl,
        providerSignedName: parsed.data.providerSignedName || access.partner.displayName,
        providerSignedAt: new Date(),
        status: parsed.data.status ?? "UNDER_PHYSICIAN_REVIEW",
      },
    });
    return NextResponse.json({ submission: updated });
  }

  // email-client
  if (!submission.clientSignatureDataUrl || !submission.providerSignatureDataUrl) {
    return NextResponse.json(
      { error: "Both client and provider signatures are required before emailing." },
      { status: 400 },
    );
  }

  const payload = (submission.payload ?? {}) as Record<string, unknown>;
  const pdf = await buildIntakePdf({
    referenceId: submission.id,
    fullName: submission.fullName,
    email: submission.email,
    phone: submission.phone,
    dateOfBirth: submission.dateOfBirth,
    referredBy: submission.referredBy,
    assignedProvider: String(payload.assignedProvider ?? access.partner.displayName),
    payload,
    clientSignatureDataUrl: submission.clientSignatureDataUrl,
    providerSignatureDataUrl: submission.providerSignatureDataUrl,
    providerSignedName: submission.providerSignedName,
    providerSignedAt: submission.providerSignedAt,
    attestationName: String(payload.attestationName ?? submission.fullName),
    attestationDate: String(payload.attestationDate ?? ""),
  });

  await sendTransactionalEmail({
    to: submission.email,
    subject: `KIAN Privé — Signed clinical intake (${submission.id})`,
    text: [
      `Hi ${submission.fullName},`,
      "",
      "Please find attached your signed Provider Connect clinical intake form.",
      `Reference: ${submission.id}`,
      "",
      `Signed by: ${submission.providerSignedName || access.partner.displayName}`,
      "",
      "— KIAN Privé",
    ].join("\n"),
    html: `<p>Hi ${submission.fullName},</p><p>Please find attached your signed Provider Connect clinical intake form.</p><p>Reference: <strong>${submission.id}</strong></p><p>Signed by: ${submission.providerSignedName || access.partner.displayName}</p><p>— KIAN Privé</p>`,
    attachments: [
      {
        filename: `kian-prive-intake-${submission.id}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return NextResponse.json({ ok: true });
}
