/**
 * Seed clinical intakes, messages, and therapy proposals for local/Docker testing.
 * Usage: node scripts/seed-clinical-intakes.mjs
 */
import { randomBytes } from "crypto";
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

function trackingToken(suffix) {
  // Stable codes for docs / track-intake testing
  if (suffix) return `KP-DEMO-${suffix}`;
  const hex = randomBytes(4).toString("hex").toUpperCase();
  return `KP-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

async function ensureMember(email, name, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: Role.MEMBER, passwordHash },
    create: { email, name, role: Role.MEMBER, passwordHash },
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
  const member = await ensureMember("member@kianprive.com", "KIAN Demo Member", "KianPriv3!Demo");
  const sophia = await ensureMember("sophia.client@kianprive.com", "Sophia Client", "Client!234");
  const daniel = await ensureMember("daniel.client@kianprive.com", "Daniel Client", "Client!234");

  const provider =
    (await prisma.partnerProfile.findFirst({
      where: { partnerCode: "CARMENRAM", type: "PROVIDER" },
    })) ||
    (await prisma.partnerProfile.findFirst({
      where: { type: "PROVIDER", status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    }));

  if (!provider) {
    throw new Error("No provider partner found. Run npm run seed:providers first.");
  }

  const clinicalProducts = await prisma.product.findMany({
    where: { catalogKind: ProductCatalogKind.CLINICAL, status: ProductStatus.ACTIVE, price: { gt: 0 } },
    orderBy: { title: "asc" },
    take: 8,
  });

  if (clinicalProducts.length < 2) {
    throw new Error("Need priced clinical products. Import PrescribeUSA CSV and set prices first.");
  }

  // Clear prior demo therapy orders + intakes (stable tokens) so re-runs are idempotent
  const demoTokens = ["KP-DEMO-PAY1", "KP-DEMO-REVW", "KP-DEMO-LABS", "KP-DEMO-DRFT", "KP-DEMO-DONE"];
  const demoOrderNumbers = ["KP-THERAPY-DEMO-PAY1", "KP-THERAPY-DEMO-DONE"];

  await prisma.order.deleteMany({ where: { orderNumber: { in: demoOrderNumbers } } });

  const existing = await prisma.therapeuticsIntakeSubmission.findMany({
    where: { publicTrackingToken: { in: demoTokens } },
    select: { id: true },
  });
  if (existing.length) {
    await prisma.therapeuticsIntakeSubmission.deleteMany({
      where: { id: { in: existing.map((r) => r.id) } },
    });
  }

  const payloadBase = (fullName, focus) => ({
    source: "seed-clinical-intakes",
    programs: ["Peptides", "Wellness Hub"],
    goals: focus,
    medications: "None reported",
    allergies: "NKDA",
    consent: true,
  });

  // 1) Member intake with SENT therapy + unpaid order → Accept & Pay ready
  const payIntake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      userId: member.id,
      fullName: member.name || "KIAN Demo Member",
      email: member.email,
      phone: "305-555-0199",
      dateOfBirth: "1988-04-12",
      programs: ["Peptides", "GLP-1"],
      status: "UNDER_PHYSICIAN_REVIEW",
      statusNote: "Therapy plan sent — awaiting patient Accept & Pay.",
      publicTrackingToken: "KP-DEMO-PAY1",
      referredBy: "Wellness Hub",
      assignedPartnerId: provider.id,
      payload: payloadBase(member.name, "Weight management and recovery peptides"),
    },
  });

  const therapyItems = clinicalProducts.slice(0, 3).map((p, i) => ({
    product: p,
    quantity: i === 0 ? 2 : 1,
  }));
  const lineItems = therapyItems.map(({ product, quantity }) => {
    const unit = Number(product.price);
    return {
      productId: product.id,
      partnerId: provider.id,
      title: product.title,
      sku: product.sku,
      quantity,
      unitPrice: unit,
      lineTotal: unit * quantity,
    };
  });
  const subtotal = lineItems.reduce((s, i) => s + Number(i.lineTotal), 0);

  const therapyOrder = await prisma.order.create({
    data: {
      orderNumber: `KP-THERAPY-DEMO-PAY1`,
      partnerId: provider.id,
      intakeSubmissionId: payIntake.id,
      userId: member.id,
      email: member.email,
      phone: "305-555-0199",
      status: "PENDING",
      paymentStatus: "UNPAID",
      fulfillmentStatus: "UNFULFILLED",
      subtotal,
      total: subtotal,
      notes: "Demo therapy proposal — ready for Accept & Pay test",
      items: { create: lineItems },
    },
  });

  await prisma.intakeTherapyProposal.create({
    data: {
      intakeSubmissionId: payIntake.id,
      providerPartnerId: provider.id,
      orderId: therapyOrder.id,
      status: "SENT",
      notes:
        "Start with the recommended peptide protocol. Take as directed. Message us if you have questions before paying.",
      sentAt: new Date(),
      items: {
        create: therapyItems.map(({ product, quantity }) => ({
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
        intakeSubmissionId: payIntake.id,
        authorRole: "PROVIDER",
        authorName: provider.displayName,
        body: "Thanks for your intake. I've prepared a therapy plan for you — review it and use Accept & Pay when ready.",
      },
      {
        intakeSubmissionId: payIntake.id,
        authorRole: "PATIENT",
        authorName: member.name || "Member",
        body: "Thank you — reviewing the plan now.",
      },
      {
        intakeSubmissionId: payIntake.id,
        authorRole: "SYSTEM",
        authorName: "KIAN Privé",
        body: "A therapy plan has been prepared for you. Review and use Accept & Pay when ready.",
      },
    ],
  });

  // 2) Pending review — provider queue
  const reviewIntake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      userId: sophia.id,
      fullName: "Sophia Client",
      email: sophia.email,
      phone: "305-555-0101",
      dateOfBirth: "1992-08-03",
      programs: ["Telemedicine", "Nutrition"],
      status: "PENDING_REVIEW",
      statusNote: null,
      publicTrackingToken: "KP-DEMO-REVW",
      referredBy: "Provider Connect",
      assignedPartnerId: provider.id,
      payload: payloadBase("Sophia Client", "Energy and metabolic support"),
    },
  });
  await prisma.intakeMessage.create({
    data: {
      intakeSubmissionId: reviewIntake.id,
      authorRole: "SYSTEM",
      authorName: "KIAN Privé",
      body: "Intake received and queued for clinical review.",
    },
  });

  // 3) Needs labs
  const labsIntake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      userId: daniel.id,
      fullName: "Daniel Client",
      email: daniel.email,
      phone: "305-555-0102",
      dateOfBirth: "1985-01-22",
      programs: ["Bloodwork", "Peptides"],
      status: "NEEDS_LABS",
      statusNote: "Please upload fasting labs from the last 90 days.",
      publicTrackingToken: "KP-DEMO-LABS",
      referredBy: "Wellness Hub",
      assignedPartnerId: provider.id,
      payload: payloadBase("Daniel Client", "Hormone optimization"),
    },
  });
  await prisma.intakeMessage.createMany({
    data: [
      {
        intakeSubmissionId: labsIntake.id,
        authorRole: "PROVIDER",
        authorName: provider.displayName,
        body: "Please send fasting labs from the last 90 days (CMP, lipid panel, A1c).",
      },
      {
        intakeSubmissionId: labsIntake.id,
        authorRole: "PATIENT",
        authorName: "Daniel Client",
        body: "I will request them from my PCP this week.",
      },
    ],
  });

  // 4) Draft therapy (not sent) — provider can edit / send
  const draftIntake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      fullName: "Jordan Rivera",
      email: "jordan.rivera@example.com",
      phone: "786-555-0144",
      dateOfBirth: "1990-11-09",
      programs: ["Peptides"],
      status: "UNDER_PHYSICIAN_REVIEW",
      statusNote: "Draft therapy in progress.",
      publicTrackingToken: "KP-DEMO-DRFT",
      referredBy: "Wellness Hub",
      assignedPartnerId: provider.id,
      payload: payloadBase("Jordan Rivera", "Recovery / inflammation"),
    },
  });
  await prisma.intakeTherapyProposal.create({
    data: {
      intakeSubmissionId: draftIntake.id,
      providerPartnerId: provider.id,
      status: "DRAFT",
      notes: "Draft only — not visible to patient until sent.",
      items: {
        create: clinicalProducts.slice(3, 5).map((product) => ({
          productId: product.id,
          quantity: 1,
          titleSnapshot: product.title,
        })),
      },
    },
  });

  // 5) Already paid therapy (shows completed path)
  const doneIntake = await prisma.therapeuticsIntakeSubmission.create({
    data: {
      userId: member.id,
      fullName: member.name || "KIAN Demo Member",
      email: member.email,
      phone: "305-555-0199",
      dateOfBirth: "1988-04-12",
      programs: ["Skincare support"],
      status: "APPROVED",
      statusNote: "Therapy paid and in fulfillment.",
      publicTrackingToken: "KP-DEMO-DONE",
      referredBy: "Wellness Hub",
      assignedPartnerId: provider.id,
      payload: payloadBase(member.name, "Prior paid therapy"),
    },
  });
  const paidProduct = clinicalProducts[5] || clinicalProducts[0];
  const paidTotal = Number(paidProduct.price);
  const paidOrder = await prisma.order.create({
    data: {
      orderNumber: "KP-THERAPY-DEMO-DONE",
      partnerId: provider.id,
      intakeSubmissionId: doneIntake.id,
      userId: member.id,
      email: member.email,
      status: "PAID",
      paymentStatus: "PAID",
      fulfillmentStatus: "PROCESSING",
      subtotal: paidTotal,
      total: paidTotal,
      authorizeNetTransId: `TEST-SEED-${Date.now()}`,
      notes: "Demo paid therapy order",
      items: {
        create: [
          {
            productId: paidProduct.id,
            partnerId: provider.id,
            title: paidProduct.title,
            sku: paidProduct.sku,
            quantity: 1,
            unitPrice: paidTotal,
            lineTotal: paidTotal,
          },
        ],
      },
      payments: {
        create: [
          {
            provider: "authorize.net.test",
            status: "PAID",
            amount: paidTotal,
            currency: "USD",
            metadata: { testMode: true, seed: true },
          },
        ],
      },
      fulfillments: {
        create: [
          {
            status: "PROCESSING",
            carrier: "UPS",
            trackingNumber: "1ZDEMO-THERAPY-001",
            trackingUrl: "https://www.ups.com/track",
            notes: "Demo seeded therapy fulfillment",
          },
        ],
      },
    },
  });
  await prisma.intakeTherapyProposal.create({
    data: {
      intakeSubmissionId: doneIntake.id,
      providerPartnerId: provider.id,
      orderId: paidOrder.id,
      status: "PAID",
      notes: "Prior therapy — already paid.",
      sentAt: new Date(Date.now() - 7 * 86400000),
      paidAt: new Date(Date.now() - 5 * 86400000),
      items: {
        create: [
          {
            productId: paidProduct.id,
            quantity: 1,
            titleSnapshot: paidProduct.title,
          },
        ],
      },
    },
  });

  const intakeCount = await prisma.therapeuticsIntakeSubmission.count();
  const proposalCount = await prisma.intakeTherapyProposal.count();
  const msgCount = await prisma.intakeMessage.count();

  console.log("Clinical intakes seeded.");
  console.log(`Provider: ${provider.displayName} (${provider.partnerCode})`);
  console.log(`Intakes: ${intakeCount}, Therapy proposals: ${proposalCount}, Messages: ${msgCount}`);
  console.log("");
  console.log("Accept & Pay ready:");
  console.log("  Login: member@kianprive.com / KianPriv3!Demo");
  console.log("  → /dashboard/intake  (token KP-DEMO-PAY1)");
  console.log("  Track: /track-intake  email member@kianprive.com  code KP-DEMO-PAY1");
  console.log("");
  console.log("Other demo tokens:");
  console.log("  KP-DEMO-REVW  pending review (sophia.client@kianprive.com / Client!234)");
  console.log("  KP-DEMO-LABS  needs labs (daniel.client@kianprive.com / Client!234)");
  console.log("  KP-DEMO-DRFT  draft therapy (provider can send)");
  console.log("  KP-DEMO-DONE  already paid therapy");
  console.log("");
  console.log(`Provider portal: ${provider.partnerCode} — carmen.ramirez@kianprive.com (if seeded)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
