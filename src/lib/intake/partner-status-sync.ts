import { PARTNER_SITES, type PartnerSite } from "@/lib/intake/partner-intake-schema";
import { prisma } from "@/lib/prisma";

export type PartnerSyncEvent =
  | "therapy.sent"
  | "therapy.paid"
  | "order.updated"
  | "intake.status";

export type PartnerSyncPayload = {
  event: PartnerSyncEvent;
  site: PartnerSite;
  externalRef?: string | null;
  localSubmissionId?: string | null;
  kianReferenceId?: string | null;
  paymentUrl?: string | null;
  orderNumber?: string | null;
  totalCents?: number | null;
  status: string;
  therapyItems?: Array<{ title: string; quantity: number; lineTotalCents?: number }>;
  fulfillment?: {
    status?: string | null;
    carrier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
  } | null;
};

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function isPartnerSite(value: unknown): value is PartnerSite {
  return typeof value === "string" && (PARTNER_SITES as readonly string[]).includes(value);
}

export function resolvePartnerSiteFromPayload(payload: unknown): PartnerSite | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (isPartnerSite(p.site)) return p.site;
  if (isPartnerSite(p.source)) return p.source;
  if (isPartnerSite(p.partnerSite)) return p.partnerSite;
  return null;
}

function partnerWebhookConfig(site: PartnerSite): { url: string; secret: string } | null {
  const url =
    site === "facial-design"
      ? process.env.FACIAL_DESIGN_WEBHOOK_URL?.trim()
      : site === "4everglow"
        ? process.env.FOREVERGLOW_WEBHOOK_URL?.trim()
        : process.env.THREEFOLD_WEBHOOK_URL?.trim();
  const secret =
    site === "facial-design"
      ? process.env.FACIAL_DESIGN_WEBHOOK_SECRET?.trim() || process.env.PARTNER_WEBHOOK_SECRET?.trim()
      : site === "4everglow"
        ? process.env.FOREVERGLOW_WEBHOOK_SECRET?.trim() || process.env.PARTNER_WEBHOOK_SECRET?.trim()
        : process.env.THREEFOLD_WEBHOOK_SECRET?.trim() || process.env.PARTNER_WEBHOOK_SECRET?.trim();

  if (!url || !secret) return null;
  return { url: url.replace(/\/$/, ""), secret };
}

export async function pushPartnerStatusEvent(payload: PartnerSyncPayload): Promise<boolean> {
  const config = partnerWebhookConfig(payload.site);
  if (!config) {
    console.warn(
      `[partner-status-sync] Skipping ${payload.event} for ${payload.site}: webhook URL/secret not configured`,
    );
    return false;
  }

  try {
    const res = await fetch(`${config.url}/api/kian/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kian-partner-secret": config.secret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[partner-status-sync] ${payload.event} → ${payload.site} failed (${res.status}): ${text.slice(0, 300)}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[partner-status-sync] ${payload.event} → ${payload.site} error:`, error);
    return false;
  }
}

type IntakeForSync = {
  id: string;
  publicTrackingToken: string | null;
  payload: unknown;
};

function extractPartnerRefs(intake: IntakeForSync) {
  const site = resolvePartnerSiteFromPayload(intake.payload);
  if (!site) return null;
  const p =
    intake.payload && typeof intake.payload === "object"
      ? (intake.payload as Record<string, unknown>)
      : {};
  return {
    site,
    externalRef: asString(p.externalRef),
    localSubmissionId: asString(p.localSubmissionId),
    kianReferenceId: intake.publicTrackingToken || intake.id,
  };
}

export async function notifyPartnerTherapySent(input: {
  intakeSubmissionId: string;
  paymentUrl?: string | null;
  orderNumber?: string | null;
  totalCents?: number | null;
  therapyItems?: PartnerSyncPayload["therapyItems"];
}) {
  const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: input.intakeSubmissionId },
    select: { id: true, publicTrackingToken: true, payload: true },
  });
  if (!intake) return false;
  const refs = extractPartnerRefs(intake);
  if (!refs) return false;

  return pushPartnerStatusEvent({
    event: "therapy.sent",
    site: refs.site,
    externalRef: refs.externalRef,
    localSubmissionId: refs.localSubmissionId,
    kianReferenceId: refs.kianReferenceId,
    paymentUrl: input.paymentUrl ?? null,
    orderNumber: input.orderNumber ?? null,
    totalCents: input.totalCents ?? null,
    status: "PAYMENT_REQUIRED",
    therapyItems: input.therapyItems,
  });
}

export async function notifyPartnerTherapyPaid(input: {
  intakeSubmissionId: string;
  orderNumber?: string | null;
  totalCents?: number | null;
}) {
  const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: input.intakeSubmissionId },
    select: { id: true, publicTrackingToken: true, payload: true },
  });
  if (!intake) return false;
  const refs = extractPartnerRefs(intake);
  if (!refs) return false;

  return pushPartnerStatusEvent({
    event: "therapy.paid",
    site: refs.site,
    externalRef: refs.externalRef,
    localSubmissionId: refs.localSubmissionId,
    kianReferenceId: refs.kianReferenceId,
    orderNumber: input.orderNumber ?? null,
    totalCents: input.totalCents ?? null,
    status: "PAID",
  });
}

export async function notifyPartnerOrderUpdated(input: {
  orderId: string;
  status: string;
  fulfillment?: PartnerSyncPayload["fulfillment"];
}) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    select: {
      orderNumber: true,
      total: true,
      intakeSubmissionId: true,
      intakeSubmission: {
        select: { id: true, publicTrackingToken: true, payload: true },
      },
    },
  });
  if (!order?.intakeSubmission) return false;
  const refs = extractPartnerRefs(order.intakeSubmission);
  if (!refs) return false;

  const partnerStatus =
    input.status === "DELIVERED" || input.status === "FULFILLED"
      ? "COMPLETED"
      : input.status === "CANCELED"
        ? "CLOSED"
        : "FULFILLING";

  return pushPartnerStatusEvent({
    event: "order.updated",
    site: refs.site,
    externalRef: refs.externalRef,
    localSubmissionId: refs.localSubmissionId,
    kianReferenceId: refs.kianReferenceId,
    orderNumber: order.orderNumber,
    totalCents: Math.round(Number(order.total) * 100),
    status: partnerStatus,
    fulfillment: input.fulfillment ?? null,
  });
}
