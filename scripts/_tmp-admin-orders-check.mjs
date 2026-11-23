import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.order.count();
  console.log("order.count", count);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: {
              featuredImage: true,
              slug: true,
              title: true,
              catalogKind: true,
              category: true,
            },
          },
        },
      },
      fulfillments: true,
      payments: true,
      refunds: true,
      partner: { select: { displayName: true, partnerCode: true, type: true } },
      intakeSubmission: {
        select: {
          id: true,
          fullName: true,
          email: true,
          publicTrackingToken: true,
          status: true,
        },
      },
      vendorPayables: {
        include: { vendor: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  console.log("findMany length", orders.length);
  const hit = orders.find((o) => o.orderNumber === "KP-THERAPY-1793624210951");
  console.log(
    "in admin list?",
    Boolean(hit),
    hit
      ? {
          orderNumber: hit.orderNumber,
          paymentStatus: hit.paymentStatus,
          fulfillmentStatus: hit.fulfillmentStatus,
          email: hit.email,
          items: hit.items.map((i) => ({
            title: i.title,
            category: i.product?.category,
            catalogKind: i.product?.catalogKind,
          })),
        }
      : null,
  );

  console.log(
    "top 10",
    orders.slice(0, 10).map((o) => ({
      n: o.orderNumber,
      pay: o.paymentStatus,
      ful: o.fulfillmentStatus,
      email: o.email,
    })),
  );
}

main()
  .catch((e) => {
    console.error("QUERY FAILED", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
