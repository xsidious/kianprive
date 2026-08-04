/**
 * Wipe demo therapy/intake data and create one clean intake for member + Carmen.
 *
 * SAFETY: refuses to run unless ALLOW_DEMO_DATA_WIPE=1 is set.
 * Never run this against the live production database.
 *
 * Usage: ALLOW_DEMO_DATA_WIPE=1 node scripts/reset-demo-therapy-flow.mjs
 */
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  SubscriptionStatus,
  SubscriptionTier,
  ProductCatalogKind,
  ProductStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function ensureMember() {
  const email = "member@kianprive.com";
  const passwordHash = await bcrypt.hash("KianPriv3!Demo", 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "KIAN Demo Member", role: Role.MEMBER, passwordHash },
    create: { email, name: "KIAN Demo Member", role: Role.MEMBER, passwordHash },
  });
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { tier: SubscriptionTier.PREMIUM, status: SubscriptionStatus.ACTIVE },
    create: {
      userId: user.id,
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
    },
  });
  return user;
}

async function main() {
  if (process.env.ALLOW_DEMO_DATA_WIPE !== "1") {
    console.error(
      "Refusing to run: this script deletes demo intake/order rows.\n" +
        "Set ALLOW_DEMO_DATA_WIPE=1 only on local/demo databases — never on live.",
    );
    process.exit(1);
  }

  const member = await ensureMember();

  const carmen =
    (await prisma.partnerProfile.findFirst({
      where: { partnerCode: "CARMENRAM", type: "PROVIDER" },
    })) ||
    (await prisma.partnerProfile.findFirst({
      where: { type: "PROVIDER", status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    }));

  if (!carmen) {
    throw new Error("Dr. Carmen / provider partner not found. Run seed:providers first.");
  }

  // Collect demo + therapy orders to delete
  const therapyOrders = await prisma.order.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: "KP-THERAPY" } },
        { therapyProposal: { isNot: null } },
        { intakeSubmissionId: { not: null } },
      ],
    },
    select: { id: true, orderNumber: true },
  });

  const demoIntakeTokens = ["KP-DEMO-PAY1", "KP-DEMO-REVW", "KP-DEMO-LABS", "KP-DEMO-DRFT", "KP-DEMO-DONE"];
  const demoIntakes = await prisma.therapeuticsIntakeSubmission.findMany({
    where: {
      OR: [
        { publicTrackingToken: { in: demoIntakeTokens } },
        { publicTrackingToken: { startsWith: "KP-DEMO" } },
        { email: { equals: member.email, mode: "insensitive" } },
        { email: { in: ["sophia.client@kianprive.com", "daniel.client@kianprive.com", "jordan.rivera@example.com"] } },
      ],
    },
    select: { id: true },
  });

  const intakeIds = demoIntakes.map((i) => i.id);
  const orderIds = therapyOrders.map((o) => o.id);

  console.log(`Deleting ${orderIds.length} therapy/intake-linked orders…`);
  if (orderIds.length) {
    await prisma.paymentRecord.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.refundRecord.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.fulfillment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    // Clear proposal→order links first
    await prisma.intakeTherapyProposal.updateMany({
      where: { orderId: { in: orderIds } },
      data: { orderId: null },
    });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  console.log(`Deleting ${intakeIds.length} intakes (messages + proposals cascade)…`);
  if (intakeIds.length) {
    await prisma.intakeTherapyItem.deleteMany({
      where: { proposal: { intakeSubmissionId: { in: intakeIds } } },
    });
    await prisma.intakeTherapyProposal.deleteMany({
      where: { intakeSubmissionId: { in: intakeIds } },
    });
    await prisma.intakeMessage.deleteMany({ where: { intakeSubmissionId: { in: intakeIds } } });
    await prisma.therapeuticsIntakeSubmission.deleteMany({ where: { id: { in: intakeIds } } });
  }

  // Also wipe any leftover demo retail orders from earlier seed (optional KP-2026-*)
  const demoRetail = await prisma.order.deleteMany({
    where: { orderNumber: { startsWith: "KP-2026-" } },
  });
  if (demoRetail.count) console.log(`Deleted ${demoRetail.count} demo retail orders.`);

  const products = await prisma.product.findMany({
    where: {
      catalogKind: ProductCatalogKind.CLINICAL,
      status: ProductStatus.ACTIVE,
      price: { gt: 0 },
    },
    orderBy: { title: "asc" },
    take: 3,
  });
  if (products.length < 1) {
    throw new Error("Need priced clinical products. Import PrescribeUSA + set prices first.");
  }

  // Ensure prices for the selected products
  await prisma.product.updateMany({
    where: { id: { in: products.map((p) => p.id) } },
    data: { price: 99 },
  });
  const priced = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.id) } },
  });

  const intake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      userId: member.id,
      fullName: member.name || "KIAN Demo Member",
      email: member.email,
      phone: "305-555-0199",
      dateOfBirth: "1988-04-12",
      programs: ["Peptides", "GLP-1"],
      status: "UNDER_PHYSICIAN_REVIEW",
      statusNote: "Therapy plan ready — awaiting Accept & Pay.",
      publicTrackingToken: "KP-DEMO-LIVE",
      referredBy: "Wellness Hub",
      assignedPartnerId: carmen.id,
      payload: {
        source: "reset-demo-therapy-flow",
        goals: "Metabolic support / peptide pathway",
        medications: "None reported",
        allergies: "NKDA",
      },
    },
  });

  const qtyMap = priced.map((p, i) => ({ product: p, quantity: i === 0 ? 2 : 1 }));
  const lineItems = qtyMap.map(({ product, quantity }) => {
    const unit = Number(product.price);
    return {
      productId: product.id,
      partnerId: carmen.id,
      title: product.title,
      sku: product.sku,
      quantity,
      unitPrice: unit,
      lineTotal: unit * quantity,
    };
  });
  const subtotal = lineItems.reduce((s, i) => s + Number(i.lineTotal), 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `KP-THERAPY-${Date.now()}`,
      partnerId: carmen.id,
      intakeSubmissionId: intake.id,
      userId: member.id,
      email: member.email,
      phone: "305-555-0199",
      status: "PENDING",
      paymentStatus: "UNPAID",
      fulfillmentStatus: "UNFULFILLED",
      subtotal,
      total: subtotal,
      notes: `Therapy proposal for ${member.name} — ready for Accept & Pay`,
      shippingAddress: {
        name: member.name,
        line1: "100 Brickell Ave",
        city: "Miami",
        state: "FL",
        postal: "33131",
        country: "US",
      },
      items: { create: lineItems },
    },
  });

  await prisma.intakeTherapyProposal.create({
    data: {
      intakeSubmissionId: intake.id,
      providerPartnerId: carmen.id,
      orderId: order.id,
      status: "SENT",
      notes: "Please review this therapy plan and use Accept & Pay when ready.",
      sentAt: new Date(),
      items: {
        create: qtyMap.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
          titleSnapshot: product.title,
        })),
      },
    },
  });

  await prisma.intakeMessage.createMany({
    data: [
      {
        intakeSubmissionId: intake.id,
        authorRole: "PROVIDER",
        authorName: carmen.displayName,
        body: "I've prepared your therapy plan. Review the products and use Accept & Pay when you're ready.",
      },
      {
        intakeSubmissionId: intake.id,
        authorRole: "SYSTEM",
        authorName: "KIAN Privé",
        body: "A therapy plan has been prepared for you. Review and use Accept & Pay when ready.",
      },
    ],
  });

  console.log("\nClean slate ready.\n");
  console.log("Member login:");
  console.log("  Email:    member@kianprive.com");
  console.log("  Password: KianPriv3!Demo");
  console.log("  Page:     /dashboard/intake");
  console.log("  Code:     KP-DEMO-LIVE");
  console.log("");
  console.log("Provider:");
  console.log(`  ${carmen.displayName} (${carmen.partnerCode})`);
  console.log("  Email:    carmen.ramirez@kianprive.com");
  console.log("  Password: CarmenRamirez#Kp5wL!");
  console.log("");
  console.log("Order (unpaid, ready to pay):");
  console.log(`  ${order.orderNumber} · $${subtotal.toFixed(2)}`);
  for (const item of lineItems) {
    console.log(`  - ${item.title} × ${item.quantity}`);
  }
  console.log("");
  console.log("After payment, check Admin → Orders for products, PAID, payment ID, and fulfillment.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
