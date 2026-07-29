import { NextResponse } from "next/server";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { buildIntakePdf } from "@/lib/intake/intake-pdf";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = await requirePartnerProfile();
  if (!access.ok) return access.response;
  if (access.partner.type !== "PROVIDER") {
    return NextResponse.json({ error: "Provider access required." }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: {
      id,
      OR: [
        { assignedPartnerId: access.partner.id },
        {
          AND: [
            { assignedPartnerId: null },
            { payload: { path: ["source"], equals: "wellness-hub" } },
          ],
        },
      ],
    },
  });

  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!submission.clientSignatureDataUrl) {
    return NextResponse.json({ error: "Client signature is missing." }, { status: 400 });
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

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kian-prive-intake-${submission.id}.pdf"`,
    },
  });
}
