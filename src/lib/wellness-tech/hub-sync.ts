/**
 * Push processing state from KIAN (current processor) into Wellness Tech (hub).
 * Best-effort — payment/clinical work never blocks on WT sync failures.
 */
import { resolvePartnerSiteFromPayload } from "@/lib/intake/partner-status-sync";
import { prisma } from "@/lib/prisma";

function wtBase() {
  return (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "https://www.wellnesstechdistribution.com")
    .trim()
    .replace(/\/$/, "");
}

function wtSecret() {
  return (
    process.env.WT_PARTNER_ORDER_SECRET?.trim() ||
    process.env.KIAN_PARTNER_SECRET?.trim() ||
    ""
  );
}

function splitName(full?: string | null) {
  const parts = String(full || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: "Patient", lastName: "Unknown" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function moneyCents(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

/** Mirror an intake + latest therapy proposal into WT ClinicalPatient records. */
export async function syncIntakeToWellnessTechHub(intakeId: string): Promise<{ ok: boolean; error?: string }> {
  const secret = wtSecret();
  const base = wtBase();
  if (!secret || !base) return { ok: false, error: "WT partner credentials missing." };

  const intake = await prisma.therapeuticsIntakeSubmission.findUnique({
    where: { id: intakeId },
    include: {
      therapyProposals: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: { items: true },
      },
      assignedPartner: { select: { id: true, displayName: true, npi: true } },
      user: { select: { email: true, name: true } },
    },
  });
  if (!intake) return { ok: false, error: "Intake not found." };

  const partnerSite =
    resolvePartnerSiteFromPayload(intake.payload) ||
    (typeof intake.referredBy === "string" && /facial/i.test(intake.referredBy)
      ? "facial-design"
      : typeof intake.referredBy === "string" && /4ever|forever/i.test(intake.referredBy)
        ? "4everglow"
        : typeof intake.referredBy === "string" && /threefold/i.test(intake.referredBy)
          ? "threefold-strength"
          : typeof intake.referredBy === "string" && /hope/i.test(intake.referredBy)
            ? "hope-and-haven"
            : "kian-prive");

  const named = splitName(intake.fullName || intake.user?.name);
  const email = (intake.email || intake.user?.email || "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "Intake missing email." };

  const proposal = intake.therapyProposals[0] || null;
  const body = {
    partnerSite,
    kianIntakeId: intake.id,
    email,
    patient: {
      firstName: named.firstName,
      lastName: named.lastName,
      dateOfBirth: intake.dateOfBirth || "",
      phone: intake.phone || "",
      email,
      gender: "",
      allergies: "",
    },
    intake: {
      id: intake.id,
      status: intake.status,
      source: partnerSite,
      reference: intake.publicTrackingToken || intake.id,
      statusNote: intake.statusNote || "",
      assignedProvider: intake.assignedPartner?.displayName || "",
      createdAt: intake.createdAt.toISOString(),
      updatedAt: intake.updatedAt.toISOString(),
    },
    therapy: proposal
      ? {
          proposalId: proposal.id,
          status: proposal.status,
          interval: proposal.billingInterval,
          totalCents: proposal.items.reduce(
            (sum, item) => sum + moneyCents(Number(item.unitPrice || 0) * item.quantity),
            0,
          ),
          items: proposal.items.map((item) => ({
            title: item.titleSnapshot,
            quantity: item.quantity,
            unitPriceCents: moneyCents(item.unitPrice),
            lineTotalCents: moneyCents(Number(item.unitPrice || 0) * item.quantity),
            productId: item.productId,
          })),
        }
      : null,
    programs: intake.programs || [],
    processing: {
      processor: "kian-prive",
      hub: "wellness-tech",
      stage: proposal?.status === "PAID" ? "fulfillment" : proposal ? "therapy" : "intake",
    },
  };

  try {
    const res = await fetch(`${base}/api/partner/intakes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wt-partner-secret": secret,
        "x-wt-partner-site": partnerSite,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `WT intake sync ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "WT intake sync failed." };
  }
}

/** Fire-and-forget wrapper for intake lifecycle hooks. */
export function voidSyncIntakeToWellnessTechHub(intakeId: string) {
  void syncIntakeToWellnessTechHub(intakeId).catch((err) => {
    console.warn("[hub-sync] intake push failed", intakeId, err);
  });
}
