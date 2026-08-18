import { NextResponse } from "next/server";
import { z } from "zod";
import type { Role, TherapyBillingInterval } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import {
  getProposalForIntake,
  serializeProposal,
  upsertTherapyProposal,
} from "@/lib/intake/therapy";

const bodySchema = z.object({
  intakeSubmissionId: z.string().min(1),
  notes: z.string().max(4000).optional().nullable(),
  send: z.boolean().optional().default(false),
  billingInterval: z
    .enum([
      "ONE_TIME",
      "WEEKLY",
      "EVERY_2_WEEKS",
      "EVERY_4_WEEKS",
      "MONTHLY",
      "EVERY_6_WEEKS",
      "EVERY_8_WEEKS",
      "CUSTOM",
    ])
    .optional()
    .default("ONE_TIME"),
  intervalDays: z.number().int().min(1).max(365).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
        unitPrice: z.number().min(0).optional().nullable(),
      }),
    )
    .min(1),
});

async function resolveProviderPartnerId(userId: string, role: Role | undefined | null) {
  if (canAccessAdmin(role)) {
    return null; // admin must pass assigned partner or we use intake.assignedPartnerId
  }
  const partner = await prisma.partnerProfile.findUnique({
    where: { userId },
    select: { id: true, type: true, status: true },
  });
  if (!partner || partner.type !== "PROVIDER" || partner.status !== "ACTIVE") {
    return null;
  }
  return partner.id;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const intakeSubmissionId = new URL(req.url).searchParams.get("intakeSubmissionId");
  if (!intakeSubmissionId) {
    return NextResponse.json({ error: "intakeSubmissionId required" }, { status: 400 });
  }

  const isAdmin = canAccessAdmin(session.user.role);
  const partnerId = await resolveProviderPartnerId(session.user.id, session.user.role);
  const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: intakeSubmissionId },
    select: { id: true, email: true, userId: true, assignedPartnerId: true },
  });
  if (!intake) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember =
    session.user.email?.toLowerCase() === intake.email.toLowerCase() ||
    session.user.id === intake.userId;
  if (!isAdmin && !partnerId && !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (partnerId && intake.assignedPartnerId && intake.assignedPartnerId !== partnerId && !isAdmin) {
    // allow assigned or unassigned claim flow elsewhere; still readable if provider has queue access
  }

  const proposal = await getProposalForIntake(intakeSubmissionId);
  return NextResponse.json({
    proposal: proposal
      ? serializeProposal(proposal, {
          includePrices: isAdmin,
          // Member may see pay total only for Accept & Pay CTA
          includePayTotal: isAdmin || isMember,
        })
      : null,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid therapy payload." }, { status: 400 });
  }

  const isAdmin = canAccessAdmin(session.user.role);
  let providerPartnerId = await resolveProviderPartnerId(session.user.id, session.user.role);

  const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: parsed.data.intakeSubmissionId },
    select: { id: true, assignedPartnerId: true },
  });
  if (!intake) return NextResponse.json({ error: "Intake not found." }, { status: 404 });

  if (isAdmin) {
    providerPartnerId = intake.assignedPartnerId;
    if (!providerPartnerId) {
      return NextResponse.json(
        { error: "Assign a practitioner to this intake before sending therapy." },
        { status: 400 },
      );
    }
  }

  if (!providerPartnerId) {
    return NextResponse.json({ error: "Only practitioners or admins can set therapy." }, { status: 403 });
  }

  try {
    const proposal = await upsertTherapyProposal({
      intakeSubmissionId: parsed.data.intakeSubmissionId,
      providerPartnerId,
      notes: parsed.data.notes,
      items: parsed.data.items,
      send: parsed.data.send,
      persistCatalogPrices: isAdmin,
      billingInterval: parsed.data.billingInterval as TherapyBillingInterval,
      intervalDays: parsed.data.intervalDays,
    });
    return NextResponse.json({
      proposal: proposal
        ? serializeProposal(proposal, {
            includePrices: isAdmin,
            includePayTotal: false,
          })
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save therapy." },
      { status: 400 },
    );
  }
}
