import { prisma } from "@/lib/prisma";
import { buildClinicalChartPackage } from "@/lib/commerce/clinical-chart-package";

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

/** Pull ship-to from intake JSON when order.shippingAddress was never collected. */
function shipFromIntakePayload(payload: unknown, fullName?: string | null) {
  if (!payload || typeof payload !== "object") return undefined;
  const p = payload as Record<string, unknown>;
  const nested =
    (p.shippingAddress && typeof p.shippingAddress === "object" ? (p.shippingAddress as Record<string, unknown>) : null) ||
    (p.shipTo && typeof p.shipTo === "object" ? (p.shipTo as Record<string, unknown>) : null) ||
    (p.address && typeof p.address === "object" ? (p.address as Record<string, unknown>) : null);

  let line1 = String(nested?.line1 || nested?.street1 || nested?.address || p.address || p.street || "").trim();
  let line2 = String(nested?.line2 || nested?.street2 || p.addressLine2 || "").trim();
  // Intake often stores "street\napt" in a single address string.
  if (line1.includes("\n") && !line2) {
    const [a, ...rest] = line1.split(/\n+/);
    line1 = a.trim();
    line2 = rest.join(" ").trim();
  }
  const city = String(nested?.city || p.city || "").trim();
  const state = String(nested?.state || p.state || "").trim();
  const zip = String(nested?.postal || nested?.zip || nested?.zipCode || p.postalCode || p.zip || "").trim();
  if (!line1 && !city && !zip) return undefined;
  return shipTo({
    name: fullName || undefined,
    line1: line1 || undefined,
    line2: line2 || undefined,
    city: city || undefined,
    state: state || undefined,
    postal: zip || undefined,
  });
}

function shippingIsComplete(ship: ReturnType<typeof shipTo>) {
  if (!ship?.street1 || !ship.city || !ship.state || !ship.zip) return false;
  if (ship.city === "Unknown" || ship.zip === "00000") return false;
  return true;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: "Patient", lastName: "Unknown" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

/** Resolve Eventide/VitaRelay platform product id (UUID) when stored on the product. */
function eventidePlatformId(item: {
  sku: string | null;
  product: {
    sku: string | null;
    externalId: string | null;
    vendorOffers: { vendorSku: string | null }[];
  };
}) {
  const external = item.product.externalId?.trim() || "";
  const stripped = external.replace(/^(rxhere:|eventide:|vitarelay:)/i, "");
  if (isUuid(stripped)) return stripped;
  if (isUuid(item.sku || "")) return (item.sku || "").trim();
  if (isUuid(item.product.sku || "")) return (item.product.sku || "").trim();
  return undefined;
}

function rxhereSku(item: {
  sku: string | null;
  product: {
    sku: string | null;
    source: string | null;
    externalId: string | null;
    vendorOffers: { vendorSku: string | null }[];
  };
}) {
  const platformId = eventidePlatformId(item);
  if (platformId) return platformId;
  const offerSku = item.product.vendorOffers.find((offer) => offer.vendorSku)?.vendorSku?.trim();
  if (offerSku) return offerSku;
  const external = item.product.externalId?.trim() || "";
  if (external.toLowerCase().startsWith("rxhere:")) return external.slice("rxhere:".length);
  if (external.toLowerCase().startsWith("eventide:")) return external.slice("eventide:".length);
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

async function retryWellnessTechPharmacySubmit(
  kianOrderId: string,
  distributionOrderId: string,
  externalRef: string,
) {
  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();
  if (!base || !secret) {
    const error = "WT_API_URL / WT_PARTNER_ORDER_SECRET is not configured.";
    await prisma.order.update({ where: { id: kianOrderId }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }

  try {
    const res = await fetch(`${base}/api/partner/orders/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wt-partner-secret": secret,
        "x-wt-partner-site": "kian-prive",
      },
      body: JSON.stringify({ orderId: distributionOrderId, externalRef }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      orderId?: string;
      rxhereOrderId?: string;
      status?: string;
      duplicate?: boolean;
    };

    if (!res.ok || !data.ok) {
      const error = data.error || `Wellness Tech pharmacy retry failed (${res.status}).`;
      await prisma.order.update({
        where: { id: kianOrderId },
        data: {
          distributionSyncError: error,
          distributionStatus: data.status || "on_hold",
        },
      });
      return { ok: false as const, error, orderId: distributionOrderId };
    }

    await prisma.order.update({
      where: { id: kianOrderId },
      data: {
        rxhereOrderId: data.rxhereOrderId || undefined,
        distributionStatus: data.status || "submitted",
        distributionSyncError: null,
      },
    });
    return {
      ok: true as const,
      orderId: distributionOrderId,
      rxhereOrderId: data.rxhereOrderId,
      retried: true as const,
      duplicate: Boolean(data.duplicate),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach Wellness Tech retry.";
    await prisma.order
      .update({ where: { id: kianOrderId }, data: { distributionSyncError: message } })
      .catch(() => undefined);
    return { ok: false as const, error: message, orderId: distributionOrderId };
  }
}

/**
 * After KIAN collects payment, place the same product lines on Wellness Tech Distribution.
 * Wellness Tech submits 503A lines to the RxHere Partner API. Payment on KIAN is not rolled back if this fails.
 */
export async function forwardPaidOrderToWellnessTech(
  orderId: string,
  options?: { force?: boolean },
) {
  const base = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "").replace(/\/$/, "");
  const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();

  let order = await prisma.order.findUnique({
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
    // Already on Wellness Tech — if pharmacy never got it (502 / on_hold), ask WT to resubmit.
    if (!order.rxhereOrderId) {
      const retried = await retryWellnessTechPharmacySubmit(
        order.id,
        order.distributionOrderId,
        order.orderNumber,
      );
      if (retried.ok) return retried;
      // Retry route missing / stale WT id → clear and create a fresh partner order.
      const retryErr = String(retried.error || "").toLowerCase();
      const shouldRecreate =
        Boolean(options?.force) ||
        retryErr.includes("404") ||
        retryErr.includes("not found") ||
        retryErr.includes("unknown order");
      if (!shouldRecreate) return retried;
      await prisma.order.update({
        where: { id: order.id },
        data: {
          distributionOrderId: null,
          distributionStatus: null,
          distributionSyncError: `Recreating after failed pharmacy retry: ${retried.error || "unknown"}`,
        },
      });
      order = await prisma.order.findUnique({
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
      if (!order) return { ok: false as const, error: "Order not found after recreate reset." };
    } else {
      return { ok: true as const, orderId: order.distributionOrderId, duplicate: true };
    }
  }
  if (!order.items.length) {
    return { ok: false as const, skipped: true, error: "No product lines." };
  }

  const email = (order.email || order.intakeSubmission?.email || order.user?.email || "").trim().toLowerCase();
  const lines = order.items
    .map((item) => {
      const platformProductId = eventidePlatformId(item);
      // WT catalog is keyed by local SKU (e.g. AA-GSH); Eventide UUID goes as platformProductId.
      const catalogSku = (item.product.sku || item.sku || "").trim();
      const sku = catalogSku || rxhereSku(item);
      return {
        sku,
        platformProductId: platformProductId || (isUuid(sku) ? sku : undefined),
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

  const intake = order.intakeSubmission;
  const profile = order.user?.profile;
  let ship =
    shipTo(order.shippingAddress) ||
    shipFromIntakePayload(intake?.payload, intake?.fullName) ||
    shipTo({
      name: intake?.fullName || order.user?.name || undefined,
      line1: profile?.addressLine1 || undefined,
      city: profile?.city || undefined,
      state: profile?.state || undefined,
      postal: profile?.postalCode || undefined,
    });

  // Persist resolved ship-to so admin UI + future retries keep a real address.
  if (ship && shippingIsComplete(ship) && !shipTo(order.shippingAddress)) {
    const shippingAddress = {
      name: ship.name || intake?.fullName || undefined,
      line1: ship.street1,
      line2: ship.street2 || undefined,
      city: ship.city,
      state: ship.state,
      postal: ship.zip,
    };
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingAddress },
    });
    ship = shipTo(shippingAddress);
  }

  const named = splitName(intake?.fullName || ship?.name || order.user?.name || "Patient");
  const provider = order.therapyProposal?.providerPartner || order.partner;
  const providerParts = splitName(
    provider?.displayName ||
      process.env.EVENTIDE_PRESCRIBER_NAME ||
      "Carmen Ramirez",
  );

  const shipMeta =
    order.shippingAddress && typeof order.shippingAddress === "object"
      ? (order.shippingAddress as Record<string, unknown>)
      : {};
  const destinationRaw = String(shipMeta.destinationType || shipMeta.shippingDestinationType || "").toLowerCase();
  const shippingDestinationType =
    destinationRaw === "provider_clinic" ||
    destinationRaw === "clinic" ||
    destinationRaw === "practitioner" ||
    destinationRaw === "office"
      ? "provider_clinic"
      : "patient_direct";
  const shipToKind =
    destinationRaw === "practitioner" || destinationRaw === "provider"
      ? "practitioner"
      : shippingDestinationType === "provider_clinic"
        ? "clinic"
        : "patient";

  if (!shippingIsComplete(ship)) {
    const error =
      "Shipping address incomplete (need street, city, state, ZIP). Update the order address, then retry pharmacy send.";
    await prisma.order.update({ where: { id: order.id }, data: { distributionSyncError: error } });
    return { ok: false as const, error };
  }

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
    npiNumber:
      provider?.npi ||
      process.env.EVENTIDE_PRESCRIBER_NPI ||
      process.env.LAB_ORDERING_PHYSICIAN_NPI ||
      "1023022357",
    practiceName: provider?.legalName || "KIAN Privé",
    phone: provider?.phone || undefined,
    licenseState: process.env.EVENTIDE_PRESCRIBER_LICENSE_STATE || "FL",
    licenseNumber: process.env.EVENTIDE_PRESCRIBER_LICENSE_NUMBER || "84581",
  };

  const clinicalChart = buildClinicalChartPackage({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      phone: order.phone,
      total: order.total,
      subtotal: order.subtotal,
      shippingTotal: order.shippingTotal,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    },
    intake,
    profile,
    therapy: order.therapyProposal
      ? {
          id: order.therapyProposal.id,
          status: order.therapyProposal.status,
          notes: order.therapyProposal.notes,
          sentAt: order.therapyProposal.sentAt,
          paidAt: order.therapyProposal.paidAt,
          billingInterval: order.therapyProposal.billingInterval,
          items: order.therapyProposal.items,
          providerPartner: order.therapyProposal.providerPartner,
        }
      : null,
    lines: sendable.map((line) => ({
      sku: line.sku,
      qty: line.qty,
      name: line.name,
      strength: line.strength,
      dosageForm: line.dosageForm,
      sig: line.sig,
    })),
  });

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
        shippingDestinationType,
        shipToKind,
        provider: provider
          ? {
              external_id: provider.id,
              name: provider.displayName || provider.legalName || "Clinic",
              kind: "clinic",
              phone: provider.phone || undefined,
              npi: provider.npi || undefined,
            }
          : undefined,
        lines: sendable.map((line) => ({
          sku: line.sku,
          platformProductId: line.platformProductId,
          qty: line.qty,
          name: line.name,
          strength: line.strength,
          dosageForm: line.dosageForm,
          sig: line.sig,
        })),
        patient,
        prescriber,
        clinicalChart,
        kianIntakeId: intake?.id || null,
        notes: [
          `KIAN Privé order ${order.orderNumber}`,
          `Ship to: ${shipToKind} (${shippingDestinationType})`,
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
      rxhereOrderId?: string;
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
        rxhereOrderId: data.rxhereOrderId || undefined,
        distributionStatus: data.rxhereOrderId ? "submitted" : data.warning ? "on_hold" : "submitted",
        distributionSyncError: data.warning || (data.rxhereOrderId ? null : "Sent to Wellness Tech; waiting on Eventide pharmacy id."),
      },
    });
    return {
      ok: true as const,
      orderId: data.orderId,
      rxhereOrderId: data.rxhereOrderId,
      warning: data.warning,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach Wellness Tech.";
    await prisma.order
      .update({ where: { id: order.id }, data: { distributionSyncError: message } })
      .catch(() => undefined);
    console.error("[distribution] forward failed:", order.orderNumber, message);
    return { ok: false as const, error: message };
  }
}
