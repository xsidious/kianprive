/**
 * Packages KIAN intake + therapy + signatures for Wellness Tech clinical charts.
 */

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function pickString(obj: JsonRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const part of parts) {
      if (!cur || typeof cur !== "object") {
        cur = undefined;
        break;
      }
      cur = (cur as JsonRecord)[part];
    }
    if (typeof cur === "string" && cur.trim()) return cur.trim();
  }
  return null;
}

function collectSignatures(intake: {
  clientSignatureDataUrl?: string | null;
  providerSignatureDataUrl?: string | null;
  providerSignedName?: string | null;
  providerSignedAt?: Date | null;
  payload: unknown;
}) {
  const payload = asRecord(intake.payload);
  const consent = asRecord(payload.consent);

  const entries: Array<{ label: string; kind: string; value: string; signedAt?: string | null; printedName?: string | null }> =
    [];

  const push = (label: string, kind: string, value: string | null | undefined, meta?: { signedAt?: string | null; printedName?: string | null }) => {
    if (!value || !String(value).trim()) return;
    entries.push({
      label,
      kind,
      value: String(value).trim(),
      signedAt: meta?.signedAt ?? null,
      printedName: meta?.printedName ?? null,
    });
  };

  push("Patient signature (intake)", "image", intake.clientSignatureDataUrl);
  push("Provider / nurse signature", "image", intake.providerSignatureDataUrl, {
    signedAt: intake.providerSignedAt?.toISOString() ?? null,
    printedName: intake.providerSignedName,
  });

  push("Typed client signature", "text", pickString(consent, "clientSignature", "printedName") || pickString(payload, "signature", "typedSignature"));
  push(
    "Consent signature (drawn)",
    "image",
    pickString(consent, "signatureDataUrl") || pickString(payload, "signatureDataUrl", "consentSignature"),
  );
  push(
    "Photo/video consent name",
    "text",
    pickString(consent, "photoVideoConsentPrintedName") || pickString(payload, "photoVideoConsentPrintedName", "consentName"),
  );
  push(
    "Photo/video consent signature",
    "text",
    pickString(consent, "photoVideoConsentSignature") || pickString(payload, "consentSignature"),
  );
  push("Consent date", "text", pickString(consent, "signatureDate", "photoVideoConsentSignedAt") || pickString(payload, "signDate", "consentDate"));

  const ack = consent.acknowledgments ?? payload.acknowledgments;
  if (Array.isArray(ack) && ack.length) {
    push("Acknowledgments", "list", JSON.stringify(ack));
  }

  return entries;
}

export function buildClinicalChartPackage(input: {
  order: {
    id: string;
    orderNumber: string;
    email: string | null;
    phone: string | null;
    total: unknown;
    subtotal: unknown;
    shippingTotal: unknown;
    paymentStatus: string;
    notes: string | null;
    shippingAddress: unknown;
    createdAt: Date;
  };
  intake: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    programs: string[];
    status: string;
    statusNote: string | null;
    publicTrackingToken: string | null;
    referredBy: string | null;
    payload: unknown;
    clientSignatureDataUrl?: string | null;
    providerSignatureDataUrl?: string | null;
    providerSignedName?: string | null;
    providerSignedAt?: Date | null;
    createdAt: Date;
  } | null;
  profile?: {
    sexAtBirth?: string | null;
    phone?: string | null;
    allergies?: string | null;
    addressLine1?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    medications?: string | null;
    medicalConditions?: string | null;
  } | null;
  therapy?: {
    id: string;
    status: string;
    notes: string | null;
    sentAt: Date | null;
    paidAt: Date | null;
    billingInterval?: string | null;
    items: Array<{ titleSnapshot: string; quantity: number; unitPrice: unknown; productId: string }>;
    providerPartner?: {
      displayName: string;
      credentialsTitle: string | null;
      npi: string | null;
      phone: string | null;
      legalName: string | null;
    } | null;
  } | null;
  lines: Array<{
    sku: string;
    qty: number;
    name: string;
    strength?: string;
    dosageForm?: string;
    sig?: string;
    unitPrice?: number;
  }>;
}) {
  const payload = asRecord(input.intake?.payload);
  const signatures = input.intake ? collectSignatures(input.intake) : [];

  return {
    version: 1,
    source: "kian-prive",
    syncedAt: new Date().toISOString(),
    order: {
      id: input.order.id,
      orderNumber: input.order.orderNumber,
      email: input.order.email,
      phone: input.order.phone,
      paymentStatus: input.order.paymentStatus,
      subtotal: Number(input.order.subtotal),
      shippingTotal: Number(input.order.shippingTotal),
      total: Number(input.order.total),
      notes: input.order.notes,
      shippingAddress: input.order.shippingAddress,
      createdAt: input.order.createdAt.toISOString(),
    },
    patient: {
      fullName: input.intake?.fullName || null,
      email: input.intake?.email || input.order.email,
      phone: input.intake?.phone || input.order.phone || input.profile?.phone || null,
      dateOfBirth: input.intake?.dateOfBirth || null,
      gender: input.profile?.sexAtBirth || pickString(payload, "sex", "gender") || null,
      allergies:
        input.profile?.allergies ||
        pickString(payload, "medAllergies", "allergies", "allergyDetail") ||
        "NKDA",
      medications: input.profile?.medications || pickString(payload, "prescriptions", "medications", "currentPeptides"),
      conditions:
        input.profile?.medicalConditions || pickString(payload, "otherCondition", "medical", "conditions"),
      address: {
        line1: input.profile?.addressLine1 || pickString(payload, "address", "addressLine1"),
        city: input.profile?.city || pickString(payload, "city"),
        state: input.profile?.state || pickString(payload, "state"),
        postalCode: input.profile?.postalCode || pickString(payload, "zip", "postalCode"),
      },
    },
    intake: input.intake
      ? {
          id: input.intake.id,
          reference: input.intake.publicTrackingToken || input.intake.id,
          status: input.intake.status,
          statusNote: input.intake.statusNote,
          programs: input.intake.programs,
          referredBy: input.intake.referredBy,
          createdAt: input.intake.createdAt.toISOString(),
          payload,
        }
      : null,
    therapy: input.therapy
      ? {
          id: input.therapy.id,
          status: input.therapy.status,
          notes: input.therapy.notes,
          sentAt: input.therapy.sentAt?.toISOString() ?? null,
          paidAt: input.therapy.paidAt?.toISOString() ?? null,
          billingInterval: input.therapy.billingInterval ?? null,
          provider: input.therapy.providerPartner
            ? {
                displayName: input.therapy.providerPartner.displayName,
                credentialsTitle: input.therapy.providerPartner.credentialsTitle,
                npi: input.therapy.providerPartner.npi,
                phone: input.therapy.providerPartner.phone,
                legalName: input.therapy.providerPartner.legalName,
              }
            : null,
          items: input.therapy.items.map((item) => ({
            productId: item.productId,
            title: item.titleSnapshot,
            quantity: item.quantity,
            unitPrice: item.unitPrice != null ? Number(item.unitPrice) : null,
          })),
        }
      : null,
    prescriptionLines: input.lines,
    signatures,
  };
}

export type ClinicalChartPackage = ReturnType<typeof buildClinicalChartPackage>;
