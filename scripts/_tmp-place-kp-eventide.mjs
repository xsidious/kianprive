import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const practice = (
  process.env.EVENTIDE_API_BASE_URL ||
  "https://vitarelay.com/api/public/practice/v1"
).replace(/\/$/, "");
const token =
  process.env.EVENTIDE_API_KEY?.trim() ||
  process.env.VITARELAY_API_KEY?.trim() ||
  "";
const alen = "daf4ab88-1c9d-4c8f-a4fe-20e3b5dcc318";
const productId = "3753ce95-1f64-4fa7-a1ff-d6f007518292";
const orderNumber = "KP-THERAPY-1793624210951";

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-User-Id": alen,
};

const body = {
  external_order_id: orderNumber,
  shipping_destination_type: "patient_direct",
  shipping_address: {
    name: "Alycia Lerer",
    line1: "1731 Plunkett Street",
    line2: "1",
    city: "Hollywood",
    state: "FL",
    postal_code: "33020",
    country: "US",
  },
  patient: {
    external_patient_id: "kian:contact@keepingitallnatural.com",
    first_name: "Alycia",
    last_name: "Lerer",
    dob: "1965-08-01",
    email: "contact@keepingitallnatural.com",
    phone: "+13057635982",
    address: {
      line1: "1731 Plunkett Street",
      line2: "1",
      city: "Hollywood",
      state: "FL",
      postal_code: "33020",
    },
  },
  prescriber: {
    full_name: "Carmen Ramirez",
    npi_number: "1023022357",
    licenses: [{ state: "FL", number: "84581" }],
  },
  prescriptions: [
    {
      platform_product_id: productId,
      drug_name: "Glutathione 200mg/mL; 10mL (2000mg)",
      strength: "200 mg/ml",
      dosage_form: "Injectable",
      sig: "As directed by prescribing clinician.",
      order_quantity: 1,
      quantity: 10,
      quantity_unit: "mL",
    },
  ],
};

const res = await fetch(`${practice}/prescriptions`, {
  method: "POST",
  headers,
  body: JSON.stringify(body),
});
const text = await res.text();
console.log("status", res.status, text);

let parsed = {};
try {
  parsed = JSON.parse(text);
} catch {
  // ignore
}

const orderId = parsed?.data?.order_id || "";
const orderNum = parsed?.data?.order_number || "";
const paymentStatus = parsed?.data?.payment_status || "";

if (res.ok && (orderId || orderNum)) {
  const updated = await prisma.order.updateMany({
    where: { orderNumber },
    data: {
      eventideOrderId: orderNum || orderId,
      distributionStatus:
        paymentStatus === "awaiting_payment" ? "awaiting_payment" : "submitted",
      distributionSyncError:
        paymentStatus === "awaiting_payment"
          ? `Eventide order ${orderNum || orderId} created; payment_status=awaiting_payment (practice card on file needed).`
          : null,
    },
  });
  console.log("kian updated", updated);
}

await prisma.$disconnect();
