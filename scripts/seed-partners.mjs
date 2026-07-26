import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  PartnerType,
  PartnerStatus,
  BookingStatus,
  CommissionSourceType,
  CommissionStatus,
  PartnerGuidelineCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

const PARTNER_PASSWORD = "Partner!234";

const partners = [
  {
    name: "Dr. Maya Chen",
    email: "partner.clinical@kianprive.com",
    displayName: "Dr. Maya Chen",
    legalName: "Maya Chen PLLC",
    type: PartnerType.CLINICAL,
    specialty: "Facial aesthetics & peptides",
    specialtyTags: ["facial-aesthetics", "glp1-peptides"],
    bio: "Board-trained aesthetic clinician partnered with KIAN Privé for facial protocols and peptide consults.",
    phone: "+1 305 555 0142",
    code: "MAYACLINIC",
    payoutMethod: "Wire",
    serviceSlugs: ["facial-aesthetics", "glp1-peptides", "microneedling-with-exosomes", "telemedicine"],
    productSlugs: ["lymphatic-support-serum", "collagen-renewal-capsules", "night-repair-facial-oil"],
  },
  {
    name: "Lumina Wellness Co",
    email: "partner.brand@kianprive.com",
    displayName: "Lumina Wellness",
    legalName: "Lumina Wellness Co LLC",
    type: PartnerType.BRAND,
    specialty: "Recovery & nutrition retail",
    specialtyTags: ["nutrition", "recovery"],
    bio: "External brand partner for recovery nutrition and retail attribution.",
    phone: "+1 786 555 0199",
    code: "LUMINABRND",
    payoutMethod: "PayPal",
    serviceSlugs: ["nutrition", "inbody-scan", "iv-therapy"],
    productSlugs: [
      "daily-recovery-electrolyte-blend",
      "metabolic-support-protein",
      "hydration-mineral-drops",
      "lymphatic-dry-brush-set",
    ],
  },
  {
    name: "Jordan Blake",
    email: "partner.both@kianprive.com",
    displayName: "Jordan Blake",
    legalName: "Jordan Blake Studio",
    type: PartnerType.BOTH,
    specialty: "Icoone & body aesthetics",
    specialtyTags: ["icoone-laser", "beauty"],
    bio: "Clinical + brand hybrid partner for body contouring and beauty retail.",
    phone: "+1 954 555 0177",
    code: "JORDANBOTH",
    payoutMethod: "Wire",
    serviceSlugs: ["icoone-laser", "beauty-hair-nails", "korean-organic-skincare"],
    productSlugs: ["advanced-beauty-essentials-kit", "overnight-barrier-repair-cream", "vitamin-c-brightening-powder"],
  },
];

async function ensureProducts() {
  const catalog = [
    { slug: "lymphatic-support-serum", title: "Lymphatic Support Serum", category: "Skincare", price: 129 },
    { slug: "daily-recovery-electrolyte-blend", title: "Daily Recovery Electrolyte Blend", category: "Nutrition", price: 59 },
    { slug: "collagen-renewal-capsules", title: "Collagen Renewal Capsules", category: "Supplements", price: 89 },
    { slug: "night-repair-facial-oil", title: "Night Repair Facial Oil", category: "Skincare", price: 98 },
    { slug: "metabolic-support-protein", title: "Metabolic Support Protein", category: "Nutrition", price: 72 },
    { slug: "advanced-beauty-essentials-kit", title: "Advanced Beauty Essentials Kit", category: "Beauty", price: 149 },
    { slug: "vitamin-c-brightening-powder", title: "Vitamin C Brightening Powder", category: "Supplements", price: 64 },
    { slug: "lymphatic-dry-brush-set", title: "Lymphatic Dry Brush Set", category: "Recovery", price: 42 },
    { slug: "hydration-mineral-drops", title: "Hydration Mineral Drops", category: "Nutrition", price: 38 },
    { slug: "overnight-barrier-repair-cream", title: "Overnight Barrier Repair Cream", category: "Skincare", price: 118 },
  ];

  const map = {};
  for (const p of catalog) {
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { title: p.title, price: p.price, status: "ACTIVE", inventoryQty: 200 },
      create: {
        slug: p.slug,
        title: p.title,
        description: `${p.title} by KIAN Privé`,
        category: p.category,
        price: p.price,
        status: "ACTIVE",
        inventoryQty: 200,
      },
    });
    map[p.slug] = row;
  }
  return map;
}

async function seedPartner(entry, products) {
  const passwordHash = await bcrypt.hash(PARTNER_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: entry.email },
    update: {
      name: entry.name,
      passwordHash,
      role: Role.PARTNER,
    },
    create: {
      name: entry.name,
      email: entry.email,
      passwordHash,
      role: Role.PARTNER,
    },
  });

  const partner = await prisma.partnerProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: entry.displayName,
      legalName: entry.legalName,
      type: entry.type,
      specialty: entry.specialty,
      specialtyTags: entry.specialtyTags,
      bio: entry.bio,
      phone: entry.phone,
      partnerCode: entry.code,
      payoutMethod: entry.payoutMethod,
      payoutDetails: { note: "Demo payout details — replace before production" },
      status: PartnerStatus.ACTIVE,
      defaultServiceCommissionPct: 20,
      defaultProductCommissionPct: 12,
      onboardingComplete: true,
    },
    create: {
      userId: user.id,
      displayName: entry.displayName,
      legalName: entry.legalName,
      type: entry.type,
      specialty: entry.specialty,
      specialtyTags: entry.specialtyTags,
      bio: entry.bio,
      phone: entry.phone,
      partnerCode: entry.code,
      payoutMethod: entry.payoutMethod,
      payoutDetails: { note: "Demo payout details — replace before production" },
      status: PartnerStatus.ACTIVE,
      defaultServiceCommissionPct: 20,
      defaultProductCommissionPct: 12,
      onboardingComplete: true,
    },
  });

  await prisma.partnerServiceAssignment.deleteMany({ where: { partnerId: partner.id } });
  await prisma.partnerServiceAssignment.createMany({
    data: entry.serviceSlugs.map((serviceSlug) => ({
      partnerId: partner.id,
      serviceSlug,
      active: true,
      commissionPct: serviceSlug === "glp1-peptides" ? 25 : null,
    })),
  });

  await prisma.partnerProductAssignment.deleteMany({ where: { partnerId: partner.id } });
  const productIds = entry.productSlugs.map((slug) => products[slug]?.id).filter(Boolean);
  if (productIds.length) {
    await prisma.partnerProductAssignment.createMany({
      data: productIds.map((productId) => ({
        partnerId: partner.id,
        productId,
        active: true,
      })),
    });
  }

  return { user, partner };
}

async function seedSampleBookings(partner) {
  const existing = await prisma.bookingRequest.count({ where: { partnerId: partner.id } });
  if (existing > 0) return;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 60);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 3);
  nextWeek.setHours(14, 30, 0, 0);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setMinutes(nextWeekEnd.getMinutes() + 45);

  const primary = partner.serviceAssignments?.[0]?.serviceSlug ?? "telemedicine";

  const pending = await prisma.bookingRequest.create({
    data: {
      partnerId: partner.id,
      fullName: "Elena Vargas",
      email: "elena.vargas@example.com",
      phone: "+1 305 555 0101",
      preferredDate: tomorrow,
      preferredLocation: "In-Clinic",
      scheduledStart: tomorrow,
      scheduledEnd: tomorrowEnd,
      timezone: "America/New_York",
      serviceIds: [primary],
      serviceTitles: [primary],
      guestTotal: 310,
      memberTotal: 248,
      status: BookingStatus.PENDING,
      notes: "Demo client — prefers afternoon if rescheduling.",
    },
  });

  const confirmed = await prisma.bookingRequest.create({
    data: {
      partnerId: partner.id,
      fullName: "Marcus Hill",
      email: "marcus.hill@example.com",
      phone: "+1 786 555 0102",
      preferredDate: nextWeek,
      preferredLocation: "In-Clinic",
      scheduledStart: nextWeek,
      scheduledEnd: nextWeekEnd,
      timezone: "America/New_York",
      serviceIds: [primary],
      serviceTitles: [primary],
      guestTotal: 310,
      memberTotal: 248,
      status: BookingStatus.CONFIRMED,
    },
  });

  await prisma.commissionLedgerEntry.createMany({
    data: [
      {
        partnerId: partner.id,
        sourceType: CommissionSourceType.SERVICE,
        bookingId: pending.id,
        description: "Pending booking commission",
        grossAmount: 248,
        commissionPct: 20,
        commissionAmount: 49.6,
        status: CommissionStatus.PENDING,
      },
      {
        partnerId: partner.id,
        sourceType: CommissionSourceType.SERVICE,
        bookingId: confirmed.id,
        description: "Confirmed booking commission",
        grossAmount: 248,
        commissionPct: 20,
        commissionAmount: 49.6,
        status: CommissionStatus.PENDING,
      },
      {
        partnerId: partner.id,
        sourceType: CommissionSourceType.PRODUCT,
        description: "Demo product sale attribution",
        grossAmount: 129,
        commissionPct: 12,
        commissionAmount: 15.48,
        status: CommissionStatus.ELIGIBLE,
      },
    ],
  });
}

async function seedGuideline() {
  const existing = await prisma.partnerGuideline.findFirst({
    where: { title: "Peptide Safety Guidelines (Demo)" },
  });
  if (existing) return existing;

  const guideline = await prisma.partnerGuideline.create({
    data: {
      title: "Peptide Safety Guidelines (Demo)",
      category: PartnerGuidelineCategory.PEPTIDES,
      body: "Demo guideline content.\n\n1. Confirm intake completed before peptide consults.\n2. Document acknowledgments in the partner portal.\n3. Escalate adverse events to KIAN concierge immediately.",
      version: "1.0",
      requiresAck: true,
      publishedAt: new Date(),
      grants: { create: [{ allPartners: true }] },
    },
  });
  return guideline;
}

async function main() {
  const products = await ensureProducts();
  const created = [];

  for (const entry of partners) {
    const { partner } = await seedPartner(entry, products);
    const withAssignments = await prisma.partnerProfile.findUnique({
      where: { id: partner.id },
      include: { serviceAssignments: true },
    });
    await seedSampleBookings(withAssignments);
    created.push({ email: entry.email, code: entry.code, displayName: entry.displayName, type: entry.type });
  }

  await seedGuideline();

  console.log("\nPartner demo accounts ready.\n");
  console.log(`Password for all: ${PARTNER_PASSWORD}\n`);
  for (const row of created) {
    console.log(`- ${row.displayName} (${row.type})`);
    console.log(`  Email: ${row.email}`);
    console.log(`  Code:  ${row.code}`);
    console.log(`  Book:  /book-online?partner=${row.code}`);
    console.log(`  Shop:  /shop?partner=${row.code}`);
    console.log("");
  }
  console.log("Login at /login then open /partner");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
