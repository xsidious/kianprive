import { prisma } from "@/lib/prisma";

type ShipAddress = Record<string, string | null | undefined>;

function shipTo(address: unknown) {
  if (!address || typeof address !== "object") return undefined;
  const ship = address as ShipAddress;
  const street1 = ship.line1 || ship.address || ship.street1 || undefined;
  const payload = {
    name: ship.name || ship.fullName || undefined,
    street1: street1 || undefined,
    street2: ship.line2 || ship.street2 || undefined,
    city: ship.city || undefined,
    state: ship.state || undefined,
    zip: ship.postal || ship.zip || ship.zipCode || undefined,
  };
  return Object.values(payload).some(Boolean) ? payload : undefined;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Patient", lastName: "Unknown" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function rxhereSku(item: {
  sku: string | null;
  product: {
    sku: string;
    source: string | null;
    externalId: string | null;
    vendorOffers: { vendorSku: string | null }[];
  };
}) {
  const offerSku = item.product.vendorOffers.find((offer) => offer.vendorSku)?.vendorSku?.trim();
  if (offerSku) return offerSku;
  const external = item.product.externalId?.trim() || "";
  if (external.toLowerCase().startsWith("rxhere:")) return external.slice("rxhere:".length);
  const sku = (item.sku || item.product.sku || "").trim();
  if (sku.toUpperCase().startsWith("RXH-")) return sku.slice(4);
  return sku;
}

function payloadAddress(ship: ReturnType<typeof shipTo>, profile?: {
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
} | null) {
  return {
    line1: ship?.street1 || profile?.addressLine1 || "Address on file",
    line2: ship?.street2 || undefined,
    city: ship?.city || profile?.city || "Unknown",
    state: ship?.state || profile?.state || "FL",
    zipCode: ship?.zip || profile?.postalCode || "00000",
    country: "US",
  };
}

/**
 * After KIAN collects payment, place the same product lines on Wellness Tech Distribution.
 * Wellness Tech submits 503A lines to the RxHere Partner API. Payment on KIAN is not rolled back if this fails.
 */
export async function forwardPaidOrderToWellnessTech(orderId: string) {
  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: {
              sku: true,
              title: true,
              form: true,
              strength: true,
              source: true,
              externalId: true,
              isPrescription: true,
              vendorOffers: { select: { vendorSku: true }, take: 3 },
            },
          },
        },
      },
      intakeSubmission: true,
      therapyProposal: {
        include: {
          providerPartner: true,
          items: true,
        },
      },
      partner: true,
      user: { include: { profile: true } },
    },
  });
  if (!order) return { ok: false as const, error: "Order not found." };
  if (order.distributionOrderId) {
    return { ok: true as const, orderId: order.distributionOrderId, duplicate: true };
  }
  if (!order.items.length) {
    return { ok: false as const, skipped: true, error: "No product lines." };
  }

  const email = (order.email || order.intakeSubmission?.email || order.user?.email || "").trim().toLowerCase();
  const lines = order.items
    .map((item) => {
      const sku = rxhereSku(item);
      return {
        sku,
        qty: item.quantity,
        title: item.title,
        name: item.product.title || item.title,
        strength: item.product.strength || undefined,
        dosageForm: item.product.form || undefined,
        sig:
          order.therapyProposal?.notes?.trim() ||
          "As directed by prescribing clinician.",
      };
    })
    .filter((line) => line.qty > 0);

  const missingSku = lines.filter((line) => !line.sku).map((line) => line.title);
  const sendable = lines.filter((line) => line.sku);

  if (!base || !secret) {
    const error = "WT_API_URL / WT_PARTNER_ORDER_SECRET is not configured.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }
  if (!email) {
    const error = "Order has no customer email, so it was not sent to Wellness Tech.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }
  if (!sendable.length) {
    const error = "No product SKUs to send to Wellness Tech.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }

  const ship = shipTo(order.shippingAddress);
  const intake = order.intakeSubmission;
  const profile = order.user?.profile;
  const named = splitName(intake?.fullName || ship?.name || order.user?.name || "Patient");
  const provider = order.therapyProposal?.providerPartner || order.partner;
  const providerParts = splitName(provider?.displayName || "KIAN Privé Clinician");

  const patient = {
    firstName: named.firstName,
    lastName: named.lastName,
    dateOfBirth: intake?.dateOfBirth || profile?.dateOfBirth || "1990-01-01",
    gender: profile?.sexAtBirth || undefined,
    phone: intake?.phone || order.phone || profile?.phone || undefined,
    email,
    allergies: profile?.allergies || "NKDA",
    address: payloadAddress(ship, profile),
  };

  const prescriber = {
    firstName: providerParts.firstName,
    lastName: providerParts.lastName,
    title: provider?.credentialsTitle || "MD",
    npiNumber: provider?.npi || process.env.LAB_ORDERING_PHYSICIAN_NPI || undefined,
    practiceName: provider?.legalName || "KIAN Privé",
    phone: provider?.phone || undefined,
  };

  try {
    const res = await fetch(`${base}/api/partner/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wt-partner-secret": secret,
        "x-wt-partner-site": "kian-prive",
      },
      body: JSON.stringify({
        externalRef: order.orderNumber,
        email,
        partnerSite: "kian-prive",
        shippingMethod: "2_DAY",
        lines: sendable.map((line) => ({
          sku: line.sku,
          qty: line.qty,
          name: line.name,
          strength: line.strength,
          dosageForm: line.dosageForm,
          sig: line.sig,
        })),
        patient,
        prescriber,
        notes: [
          `KIAN Privé order ${order.orderNumber}`,
          intake ? `Intake ${intake.id}` : "",
          missingSku.length ? `Lines without a SKU were not sent: ${missingSku.join(", ")}` : "",
          order.notes || "",
          order.therapyProposal?.notes || "",
        ]
          .filter(Boolean)
          .join("\n"),
        shipTo: ship || {
          name: `${patient.firstName} ${patient.lastName}`,
          street1: patient.address.line1,
          street2: patient.address.line2,
          city: patient.address.city,
          state: patient.address.state,
          zip: patient.address.zipCode,
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      orderId?: string;
      warning?: string;
    };

    if (!res.ok || !data.orderId) {
      const error = data.error || `Wellness Tech order failed (${res.status}).`;
      await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
      return { ok: false as const, error };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        distributionOrderId: data.orderId,
        distributionSyncError: data.warning || null,
      },
    });
    return { ok: true as const, orderId: data.orderId, warning: data.warning };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach Wellness Tech.";
    await prisma.order
      .update({ where: { id: order.id }, data: { distributionSyncError: message } })
      .catch(() => undefined);
    console.error("[distribution] forward failed:", order.orderNumber, message);
    return { ok: false as const, error: message };
  }
}
