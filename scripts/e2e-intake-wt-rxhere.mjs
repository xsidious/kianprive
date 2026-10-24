/**
 * End-to-end smoke: partner intake → signed → paid therapy → Wellness Tech → RxHere.
 *
 * Does NOT charge a card. Creates a signed intake + PAID therapy order in the KIAN DB,
 * then POSTs to WT /api/partner/orders (which calls RxHere Partner API when token is set).
 *
 * Usage:
 *   node scripts/e2e-intake-wt-rxhere.mjs
 *   WT_API_URL=http://localhost:3013 node scripts/e2e-intake-wt-rxhere.mjs
 *
 * Optional:
 *   E2E_SKU=WL-MET
 *   E2E_SKIP_RXHERE=1   # stop after building KIAN records (no WT call)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WT_BASE = (process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL || "http://localhost:3013").replace(
  /\/$/,
  "",
);
const WT_SECRET = process.env.WT_PARTNER_ORDER_SECRET?.trim();
const SKU = (process.env.E2E_SKU || "WL-MET").trim();
const stamp = Date.now();
const email = `e2e.pipeline.${stamp}@kianprive.test`;

function tinyPngDataUrl() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
}

async function main() {
  console.log("=== E2E intake → WT → RxHere ===");
  console.log(`WT: ${WT_BASE}`);
  console.log(`SKU: ${SKU}`);

  if (!WT_SECRET && process.env.E2E_SKIP_RXHERE !== "1") {
    throw new Error("WT_PARTNER_ORDER_SECRET missing in KIAN .env");
  }

  const product = await prisma.product.findFirst({
    where: { sku: SKU, source: "RXHERE", catalogKind: "CLINICAL", status: "ACTIVE" },
    include: { vendorOffers: { take: 1 } },
  });
  if (!product) throw new Error(`CLINICAL RxHere product ${SKU} not found. Import formulary first.`);

  const provider =
    (await prisma.partnerProfile.findFirst({
      where: { partnerCode: "CARMENRAM", type: "PROVIDER" },
    })) ||
    (await prisma.partnerProfile.findFirst({
      where: { type: "PROVIDER", status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    }));
  if (!provider) throw new Error("No provider partner found.");

  const sig = tinyPngDataUrl();
  const intake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      fullName: "E2E Pipeline Smoke",
      email,
      phone: "3055550199",
      dateOfBirth: "1990-01-15",
      programs: ["Partner · 4everglow Wellness", "Clinical peptide / GLP intake", "E2E smoke"],
      status: "APPROVED",
      statusNote: "E2E automated pipeline test — safe to ignore.",
      assignedPartnerId: provider.id,
      clientSignatureDataUrl: sig,
      providerSignatureDataUrl: sig,
      providerSignedName: provider.displayName || "E2E Provider",
      providerSignedAt: new Date(),
      payload: {
        source: "4everglow",
        site: "4everglow",
        siteLabel: "4everglow Wellness",
        type: "peptide_intake",
        externalRef: `e2e-${stamp}`,
        email,
        fullName: "E2E Pipeline Smoke",
        phone: "3055550199",
        dateOfBirth: "1990-01-15",
        purpose: "Peptide Therapy",
        address: {
          line1: "123 Test Harbor Ave",
          city: "Miami",
          state: "FL",
          postalCode: "33139",
        },
        consent: {
          signatureDataUrl: sig,
          typedName: "E2E Pipeline Smoke",
          signedDate: "2026-10-08",
          acknowledgeRisks: true,
          acknowledgeTelehealth: true,
        },
        e2e: true,
      },
    },
  });
  console.log("1) Intake created + dual-signed:", intake.id);

  const unit = Number(product.price) || 10;
  const shippingTotal = 35;
  const orderNumber = `KP-THERAPY-E2E-${stamp}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      email,
      phone: "3055550199",
      status: "PAID",
      paymentStatus: "PAID",
      fulfillmentStatus: "UNFULFILLED",
      subtotal: unit,
      shippingTotal,
      total: unit + shippingTotal,
      notes: "E2E smoke therapy order (payment simulated).",
      shippingAddress: {
        name: "E2E Pipeline Smoke",
        line1: "123 Test Harbor Ave",
        city: "Miami",
        state: "FL",
        postal: "33139",
      },
      partner: { connect: { id: provider.id } },
      intakeSubmission: { connect: { id: intake.id } },
      items: {
        create: [
          {
            title: product.title,
            sku: product.sku,
            quantity: 1,
            unitPrice: unit,
            lineTotal: unit,
            product: { connect: { id: product.id } },
            partner: { connect: { id: provider.id } },
          },
        ],
      },
    },
  });

  const proposal = await prisma.intakeTherapyProposal.create({
    data: {
      status: "PAID",
      notes: "Take as directed. E2E smoke prescription.",
      sentAt: new Date(),
      paidAt: new Date(),
      billingInterval: "ONE_TIME",
      intakeSubmission: { connect: { id: intake.id } },
      providerPartner: { connect: { id: provider.id } },
      order: { connect: { id: order.id } },
      items: {
        create: [
          {
            quantity: 1,
            unitPrice: unit,
            titleSnapshot: product.title,
            product: { connect: { id: product.id } },
          },
        ],
      },
    },
  });
  console.log("2) Therapy + PAID order:", order.orderNumber, "proposal", proposal.id);

  if (process.env.E2E_SKIP_RXHERE === "1") {
    console.log("Skipped WT/RxHere (E2E_SKIP_RXHERE=1).");
    return;
  }

  const vendorSku = product.vendorOffers[0]?.vendorSku || product.sku;
  const body = {
    externalRef: order.orderNumber,
    email,
    partnerSite: "kian-prive",
    shippingMethod: "2_DAY",
    kianIntakeId: intake.id,
    lines: [
      {
        sku: vendorSku,
        qty: 1,
        name: product.title,
        strength: product.strength || undefined,
        dosageForm: product.form || undefined,
        sig: "Take as directed. E2E smoke prescription.",
      },
    ],
    patient: {
      firstName: "E2E",
      lastName: "Pipeline Smoke",
      dateOfBirth: "1990-01-15",
      phone: "3055550199",
      email,
      allergies: "NKDA",
      address: {
        line1: "123 Test Harbor Ave",
        city: "Miami",
        state: "FL",
        zipCode: "33139",
        country: "US",
      },
    },
    prescriber: {
      firstName: (provider.displayName || "Carmen").split(/\s+/)[0],
      lastName: (provider.displayName || "Ramirez MD").split(/\s+/).slice(1).join(" ") || "Ramirez",
      title: provider.credentialsTitle || "MD",
      npiNumber: process.env.LAB_ORDERING_PHYSICIAN_NPI || undefined,
      practiceName: provider.legalName || "KIAN Privé",
      phone: provider.phone || undefined,
    },
    clinicalChart: {
      patient: {
        fullName: "E2E Pipeline Smoke",
        email,
        phone: "3055550199",
        dateOfBirth: "1990-01-15",
        allergies: "NKDA",
        address: {
          line1: "123 Test Harbor Ave",
          city: "Miami",
          state: "FL",
          postalCode: "33139",
        },
      },
      intake: {
        id: intake.id,
        reference: intake.id,
        status: intake.status,
        statusNote: intake.statusNote,
        programs: intake.programs,
        payload: intake.payload,
      },
      signatures: [
        { role: "patient", name: "E2E Pipeline Smoke", dataUrl: sig, signedAt: new Date().toISOString() },
        {
          role: "provider",
          name: provider.displayName || "Provider",
          dataUrl: sig,
          signedAt: new Date().toISOString(),
        },
      ],
      therapy: {
        id: proposal.id,
        status: "PAID",
        notes: proposal.notes,
        lines: [{ sku: vendorSku, qty: 1, name: product.title }],
      },
    },
    notes: `KIAN Privé order ${order.orderNumber}\nIntake ${intake.id}\nE2E smoke`,
    shipTo: {
      name: "E2E Pipeline Smoke",
      street1: "123 Test Harbor Ave",
      city: "Miami",
      state: "FL",
      zip: "33139",
    },
  };

  console.log("3) POST", `${WT_BASE}/api/partner/orders`);
  const res = await fetch(`${WT_BASE}/api/partner/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wt-partner-secret": WT_SECRET,
      "x-wt-partner-site": "kian-prive",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  console.log("   status", res.status, JSON.stringify(data, null, 2));

  if (!res.ok || !data.orderId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { distributionSyncError: data.error || `WT failed (${res.status})` },
    });
    throw new Error(data.error || `Wellness Tech order failed (${res.status})`);
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      distributionOrderId: data.orderId,
      distributionSyncError: data.warning || null,
    },
  });

  console.log("4) KIAN order linked to WT", data.orderId);
  if (data.rxhereOrderId) {
    console.log("5) RxHere order id:", data.rxhereOrderId);
  } else if (data.warning) {
    console.log("5) WT order created but pharmacy warning:", data.warning);
  } else {
    console.log("5) No rxhereOrderId in response — check WT order record / sandbox mode.");
  }

  console.log("\nOK");
  console.log(
    JSON.stringify(
      {
        intakeId: intake.id,
        orderNumber: order.orderNumber,
        kianOrderId: order.id,
        wtOrderId: data.orderId,
        invoiceNumber: data.invoiceNumber,
        rxhereOrderId: data.rxhereOrderId || null,
        warning: data.warning || null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error("\nFAIL:", e.message || e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
