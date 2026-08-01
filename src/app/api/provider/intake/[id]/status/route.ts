import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { requirePartnerProfile } from "@/lib/partner-guard";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/rbac";
import { sendTransactionalEmail } from "@/lib/email";
import {
  INTAKE_STATUS_OPTIONS,
  intakeTrackUrl,
  patientFacingIntakeStatus,
} from "@/lib/intake/tracking";
import type { IntakeSubmissionStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  status: z.enum([
    "PENDING_REVIEW",
    "UNDER_PHYSICIAN_REVIEW",
    "NEEDS_LABS",
    "NEEDS_FOLLOW_UP",
    "APPROVED",
    "DECLINED",
  ]),
  statusNote: z.string().max(2000).optional(),
  notifyPatient: z.boolean().optional().default(true),
  createOrderDraft: z.boolean().optional().default(false),
});

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  const isAdmin = Boolean(session?.user?.id && canAccessAdmin(session.user.role));

  let partnerId: string | null = null;
  if (!isAdmin) {
    const access = await requirePartnerProfile();
    if (!access.ok) return access.response;
    if (access.partner.type !== "PROVIDER") {
      return NextResponse.json({ error: "Provider access required." }, { status: 403 });
    }
    partnerId = access.partner.id;
  }

  const { id } = await params;
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
  }

  const submission = await prisma.therapeuticsIntakeSubmission.findFirst({
    where: isAdmin
      ? { id }
      : {
          id,
          OR: [
            { assignedPartnerId: partnerId! },
            {
              AND: [
                { assignedPartnerId: null },
                { payload: { path: ["source"], equals: "wellness-hub" } },
              ],
            },
          ],
        },
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const status = parsed.data.status as IntakeSubmissionStatus;
  if (!INTAKE_STATUS_OPTIONS.includes(status)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  }

  let order = null as null | { id: string; orderNumber: string };

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.therapeuticsIntakeSubmission.update({
      where: { id },
      data: {
        status,
        statusNote: parsed.data.statusNote?.trim() || null,
        assignedPartnerId: submission.assignedPartnerId ?? partnerId,
      },
    });

    if (parsed.data.createOrderDraft && status === "APPROVED") {
      const existing = await tx.order.findFirst({
        where: { intakeSubmissionId: id, paymentStatus: "UNPAID" },
        orderBy: { createdAt: "desc" },
      });
      if (existing) {
        order = { id: existing.id, orderNumber: existing.orderNumber };
      } else {
        const created = await tx.order.create({
          data: {
            orderNumber: `KP-INTAKE-${Date.now()}`,
            userId: submission.userId,
            partnerId: partnerId ?? submission.assignedPartnerId,
            intakeSubmissionId: id,
            email: submission.email,
            phone: submission.phone,
            status: "PENDING",
            paymentStatus: "UNPAID",
            fulfillmentStatus: "UNFULFILLED",
            notes: `Clinical intake approved. Draft order for protocol fulfillment. Ref ${id}`,
            total: 0,
            subtotal: 0,
          },
        });
        order = { id: created.id, orderNumber: created.orderNumber };
      }
    }

    return row;
  });

  if (parsed.data.notifyPatient) {
    const referenceCode = updated.publicTrackingToken || updated.id;
    const track = intakeTrackUrl({
      referenceCode,
      email: updated.email,
    });
    const label = patientFacingIntakeStatus(status);
    try {
      await sendTransactionalEmail({
        to: updated.email,
        subject: `KIAN Privé — Intake update: ${label}`,
        text: [
          `Hi ${updated.fullName},`,
          "",
          `Your clinical intake status is now: ${label}.`,
          parsed.data.statusNote?.trim() ? `\nNote from your provider:\n${parsed.data.statusNote.trim()}\n` : "",
          `Request code: ${referenceCode}`,
          `Track your request: ${track}`,
          order ? `\nA fulfillment order draft was created: ${order.orderNumber}` : "",
          "",
          status === "APPROVED"
            ? "Next step: our team will coordinate treatment / product fulfillment. Sign in at kianprive.com to view progress."
            : status === "NEEDS_LABS"
              ? "Please arrange updated labs or evaluation as noted. Reply to this email if you need guidance."
              : "Our team will follow up if anything else is needed.",
          "",
          "— KIAN Privé Clinical Team",
        ]
          .filter(Boolean)
          .join("\n"),
        html: `<p>Hi ${updated.fullName},</p><p>Your clinical intake status is now: <strong>${label}</strong>.</p>${
          parsed.data.statusNote?.trim()
            ? `<p><em>Note from your provider:</em><br/>${parsed.data.statusNote
                .trim()
                .replace(/</g, "&lt;")}</p>`
            : ""
        }<p>Request code: <strong>${referenceCode}</strong></p><p><a href="${track}">Track your request</a></p>${
          order ? `<p>Order draft: <strong>${order.orderNumber}</strong></p>` : ""
        }<p>— KIAN Privé Clinical Team</p>`,
      });
    } catch (err) {
      console.error("[intake/status] patient notify failed", err);
    }
  }

  return NextResponse.json({
    ok: true,
    submission: updated,
    order,
    statusLabel: patientFacingIntakeStatus(status),
  });
}
