import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = (process.env.WT_API_URL || "").replace(/\/$/, "");
const secret = process.env.WT_PARTNER_ORDER_SECRET?.trim();

const order = await prisma.order.findUnique({
  where: { orderNumber: "KP-THERAPY-1793624210951" },
  include: {
    items: { include: { product: { include: { vendorOffers: { take: 3 } } } } },
    intakeSubmission: true,
    therapyProposal: { include: { providerPartner: true, items: true } },
    partner: true,
  },
});

const ship = order.shippingAddress;
const email = order.email;
const platformId = (order.items[0].product.externalId || "").replace(/^eventide:/i, "");

const body = {
  externalRef: order.orderNumber,
  email,
  partnerSite: "kian-prive",
  shippingMethod: "2_DAY",
  shippingDestinationType: "patient_direct",
  shipToKind: "patient",
  provider: {
    external_id: order.partner?.id,
    name: order.partner?.displayName || "Dr. Carmen Ramirez",
    kind: "clinic",
    npi: process.env.EVENTIDE_PRESCRIBER_NPI || "1023022357",
  },
  lines: [
    {
      sku: platformId,
      platformProductId: platformId,
      qty: order.items[0].quantity,
      name: order.items[0].title,
      strength: order.items[0].product.strength || undefined,
      dosageForm: order.items[0].product.form || undefined,
      sig: "As directed by prescribing clinician.",
    },
  ],
  patient: {
    firstName: "Alycia",
    lastName: "Lerer",
    dateOfBirth: order.intakeSubmission?.dateOfBirth || "1990-01-01",
    phone: order.phone,
    email,
    allergies: "NKDA",
    address: {
      line1: ship.line1,
      line2: ship.line2,
      city: ship.city,
      state: ship.state,
      zipCode: ship.postal,
      country: "US",
    },
  },
  prescriber: {
    firstName: "Carmen",
    lastName: "Ramirez",
    title: "MD",
    npiNumber: process.env.EVENTIDE_PRESCRIBER_NPI || "1023022357",
    practiceName: "KIAN Privé",
    licenseState: process.env.EVENTIDE_PRESCRIBER_LICENSE_STATE || "FL",
    licenseNumber: process.env.EVENTIDE_PRESCRIBER_LICENSE_NUMBER || "84581",
  },
  shipTo: {
    name: ship.name,
    street1: ship.line1,
    street2: ship.line2,
    city: ship.city,
    state: ship.state,
    zip: ship.postal,
  },
  notes: `Debug resubmit ${order.orderNumber}`,
  forcePharmacy: true,
  resubmitPharmacy: true,
};

const res = await fetch(`${base}/api/partner/orders`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-wt-partner-secret": secret,
    "x-wt-partner-site": "kian-prive",
  },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log("status", res.status);
console.log(text);

// try alternate retry paths
for (const path of [
  "/api/partner/orders/retry",
  "/api/partner/orders/pharmacy-retry",
  "/api/partner/orders/resubmit",
]) {
  const r = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wt-partner-secret": secret,
      "x-wt-partner-site": "kian-prive",
    },
    body: JSON.stringify({
      orderId: "cmvz9vrjq0003l507xd0reez0",
      externalRef: order.orderNumber,
      force: true,
    }),
  });
  console.log(path, r.status, (await r.text()).slice(0, 500));
}

await prisma.$disconnect();
