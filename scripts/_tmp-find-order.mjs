import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const needle = "KP-THERAPY-1793624210951";
const fragment = "1793624210951";
const knownId = "cmvz9jmko0004jq08lkwse95c"; // from earlier webhook test response

function summarize(o) {
  if (!o) return null;
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    total: o.total,
    email: o.email,
    phone: o.phone,
    userId: o.userId,
    partnerId: o.partnerId,
    distributionOrderId: o.distributionOrderId,
    distributionStatus: o.distributionStatus,
    eventideOrderId: o.eventideOrderId,
    distributionSyncError: o.distributionSyncError,
    authorizeNetTransId: o.authorizeNetTransId,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    items: (o.items || []).map((i) => ({
      id: i.id,
      title: i.title,
      qty: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    payments: (o.payments || []).map((p) => ({
      id: p.id,
      status: p.status,
      amount: p.amount,
      provider: p.provider,
      createdAt: p.createdAt,
    })),
  };
}

async function main() {
  const db = (process.env.DATABASE_URL || "").replace(/:[^:@/]+@/, ":***@");
  console.log("DATABASE_URL:", db.slice(0, 140));

  const byId = await prisma.order.findUnique({
    where: { id: knownId },
    include: { items: true, payments: true, fulfillments: true },
  });
  console.log("\n=== by known id ===");
  console.log(JSON.stringify(summarize(byId), null, 2));

  const exact = await prisma.order.findUnique({
    where: { orderNumber: needle },
    include: { items: true, payments: true, fulfillments: true },
  });
  console.log("\n=== by orderNumber ===");
  console.log(JSON.stringify(summarize(exact), null, 2));

  const contains = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { contains: fragment } },
        { distributionOrderId: { contains: fragment } },
        { eventideOrderId: { contains: fragment } },
        { notes: { contains: fragment } },
      ],
    },
    include: { items: true, payments: true },
    take: 20,
  });
  console.log("\n=== contains fragment count ===", contains.length);
  for (const o of contains) console.log(JSON.stringify(summarize(o), null, 2));

  // $40 paid therapy orders
  const forty = await prisma.order.findMany({
    where: {
      orderNumber: { startsWith: "KP-THERAPY-" },
      paymentStatus: "PAID",
      total: 40,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      total: true,
      email: true,
      distributionStatus: true,
      distributionSyncError: true,
      createdAt: true,
    },
  });
  console.log("\n=== PAID KP-THERAPY totaling 40 ===");
  console.log(JSON.stringify(forty, null, 2));

  const recent = await prisma.order.findMany({
    where: { orderNumber: { startsWith: "KP-THERAPY-" } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      total: true,
      email: true,
      distributionStatus: true,
      createdAt: true,
    },
  });
  console.log("\n=== recent KP-THERAPY ===");
  console.log(JSON.stringify(recent, null, 2));

  try {
    const audits = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: "order" } },
          { entityId: knownId },
          { entityId: exact?.id || knownId },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    console.log("\n=== auditLog ===", audits.length);
    console.log(JSON.stringify(audits, null, 2).slice(0, 4000));
  } catch (e) {
    console.log("\n=== auditLog error ===", e.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
