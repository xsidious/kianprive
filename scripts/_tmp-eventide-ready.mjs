import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const order = await prisma.order.findUnique({
  where: { orderNumber: "KP-THERAPY-1793624210951" },
  include: {
    items: {
      include: {
        product: {
          include: {
            vendorOffers: { take: 3 },
          },
        },
      },
    },
    intakeSubmission: true,
    therapyProposal: { include: { providerPartner: true } },
    partner: true,
    user: { select: { email: true, name: true } },
    payments: true,
  },
});

if (!order) {
  console.log(JSON.stringify({ error: "order not found" }));
  process.exit(1);
}

const env = {
  WT_API_URL: Boolean(process.env.WT_API_URL || process.env.WELLNESS_TECH_API_URL),
  WT_PARTNER_ORDER_SECRET: Boolean(process.env.WT_PARTNER_ORDER_SECRET),
  EVENTIDE_API_KEY: Boolean(process.env.EVENTIDE_API_KEY || process.env.EVENTIDE_API_KEY || process.env.VITARELAY_API_KEY),
  EVENTIDE_WEBHOOK_SECRET: Boolean(process.env.EVENTIDE_WEBHOOK_SECRET || process.env.EVENTIDE_WEBHOOK_SECRET),
  EVENTIDE_PRESCRIBER_NPI: process.env.EVENTIDE_PRESCRIBER_NPI || null,
  EVENTIDE_PRESCRIBER_NAME: process.env.EVENTIDE_PRESCRIBER_NAME || null,
  THERAPY_PAYMENT_MODE: process.env.THERAPY_PAYMENT_MODE || null,
};

const intake = order.intakeSubmission;
const payload = intake?.payload && typeof intake.payload === "object" ? intake.payload : null;

console.log(
  JSON.stringify(
    {
      env,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status,
        email: order.email,
        phone: order.phone,
        shippingAddress: order.shippingAddress,
        distributionOrderId: order.distributionOrderId,
        distributionStatus: order.distributionStatus,
        eventideOrderId: order.eventideOrderId,
        distributionSyncError: order.distributionSyncError,
        total: order.total,
        shippingTotal: order.shippingTotal,
      },
      intake: intake
        ? {
            id: intake.id,
            email: intake.email,
            fullName: intake.fullName,
            phone: intake.phone,
            status: intake.status,
            payloadKeys: payload && typeof payload === "object" ? Object.keys(payload) : [],
            addressHints: payload
              ? {
                  address: payload.address ?? payload.shippingAddress ?? payload.shipTo ?? null,
                  city: payload.city ?? null,
                  state: payload.state ?? null,
                  zip: payload.zip ?? payload.postalCode ?? null,
                }
              : null,
          }
        : null,
      partner: order.partner
        ? {
            id: order.partner.id,
            displayName: order.partner.displayName,
            npi: order.partner.npi,
            licenseState: order.partner.licenseState,
            licenseNumber: order.partner.licenseNumber,
          }
        : null,
      providerPartner: order.therapyProposal?.providerPartner
        ? {
            id: order.therapyProposal.providerPartner.id,
            displayName: order.therapyProposal.providerPartner.displayName,
            npi: order.therapyProposal.providerPartner.npi,
            licenseState: order.therapyProposal.providerPartner.licenseState,
            licenseNumber: order.therapyProposal.providerPartner.licenseNumber,
          }
        : null,
      items: order.items.map((i) => ({
        title: i.title,
        sku: i.sku,
        productSku: i.product?.sku,
        externalId: i.product?.externalId,
        source: i.product?.source,
        catalogKind: i.product?.catalogKind,
        vendorSkus: i.product?.vendorOffers?.map((v) => v.vendorSku) ?? [],
      })),
      payments: order.payments.map((p) => ({ status: p.status, amount: p.amount, provider: p.provider })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
