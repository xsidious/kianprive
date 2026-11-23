import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const orderNumber = "KP-THERAPY-1793624210951";
const base = (process.env.EVENTIDE_API_BASE_URL || process.env.EVENTIDE_API_BASE_URL || "").replace(/\/$/, "");
const token =
  process.env.EVENTIDE_API_KEY?.trim() ||
  process.env.VITARELAY_API_KEY?.trim() ||
  process.env.EVENTIDE_API_KEY?.trim() ||
  process.env.EVENTIDE_API_TOKEN?.trim() ||
  "";

const order = await prisma.order.findUnique({
  where: { orderNumber },
  include: {
    items: { include: { product: true } },
    intakeSubmission: true,
  },
});
if (!order) {
  console.error("missing order");
  process.exit(1);
}

const ship = order.shippingAddress || {};
const platformId = String(order.items[0]?.product?.externalId || "")
  .replace(/^(eventide:|eventide:|vitarelay:)/i, "")
  .trim();

const body = {
  external_order_id: order.orderNumber,
  shipping_destination_type: "patient_direct",
  patient: {
    first_name: "Alycia",
    last_name: "Lerer",
    dob: order.intakeSubmission?.dateOfBirth || "1990-01-01",
    email: order.email,
    phone: order.phone || undefined,
    external_patient_id: order.email || undefined,
    address: {
      line1: ship.line1,
      line2: ship.line2 || undefined,
      city: ship.city,
      state: ship.state,
      postal_code: ship.postal,
    },
  },
  prescriptions: [
    {
      platform_product_id: platformId,
      drug_name: order.items[0].title,
      strength: order.items[0].product?.strength || undefined,
      dosage_form: order.items[0].product?.form || undefined,
      sig: "As directed by prescribing clinician.",
      quantity: order.items[0].quantity,
    },
  ],
  shipping_address: {
    name: ship.name || "Alycia Lerer",
    line1: ship.line1,
    line2: ship.line2 || undefined,
    city: ship.city,
    state: ship.state,
    postal_code: ship.postal,
    country: "US",
  },
  prescriber: {
    full_name: process.env.EVENTIDE_PRESCRIBER_NAME || "Carmen Ramirez",
    npi_number: (process.env.EVENTIDE_PRESCRIBER_NPI || "1023022357").replace(/\D/g, ""),
    licenses: [
      {
        state: process.env.EVENTIDE_PRESCRIBER_LICENSE_STATE || "FL",
        number: process.env.EVENTIDE_PRESCRIBER_LICENSE_NUMBER || "84581",
      },
    ],
  },
};

console.log(
  JSON.stringify(
    {
      base,
      tokenLen: token.length,
      platformId,
      ship,
      external_order_id: body.external_order_id,
    },
    null,
    2,
  ),
);

const res = await fetch(`${base}/prescriptions`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log("STATUS", res.status);
console.log(text.slice(0, 4000));
await prisma.$disconnect();
