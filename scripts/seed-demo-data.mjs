import bcrypt from "bcryptjs";
import {
  PrismaClient,
  ProductStatus,
  Role,
  SubscriptionStatus,
  SubscriptionTier,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  BookingStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const demoUsers = [
  { name: "KIAN Admin", email: "admin@kianprive.com", password: "KianPriv3!Admin", role: Role.ADMIN },
  { name: "KIAN Demo Member", email: "member@kianprive.com", password: "KianPriv3!Demo", role: Role.MEMBER },
  { name: "Sophia Client", email: "sophia.client@kianprive.com", password: "Client!234", role: Role.MEMBER },
  { name: "Daniel Client", email: "daniel.client@kianprive.com", password: "Client!234", role: Role.MEMBER },
  { name: "Alyssa Client", email: "alyssa.client@kianprive.com", password: "Client!234", role: Role.MEMBER },
];

const demoProducts = [
  { slug: "lymphatic-support-serum", title: "Lymphatic Support Serum", category: "Skincare", price: 129, image: "/images/facial-treatments.jpg" },
  { slug: "daily-recovery-electrolyte-blend", title: "Daily Recovery Electrolyte Blend", category: "Nutrition", price: 59, image: "/images/beauty.avif" },
  { slug: "collagen-renewal-capsules", title: "Collagen Renewal Capsules", category: "Supplements", price: 89, image: "/images/esthetics.avif" },
  { slug: "night-repair-facial-oil", title: "Night Repair Facial Oil", category: "Skincare", price: 98, image: "/images/facial-treatments.jpg" },
  { slug: "metabolic-support-protein", title: "Metabolic Support Protein", category: "Nutrition", price: 72, image: "/images/nutrition.avif" },
  { slug: "advanced-beauty-essentials-kit", title: "Advanced Beauty Essentials Kit", category: "Beauty", price: 149, image: "/images/wellness.avif" },
  { slug: "vitamin-c-brightening-powder", title: "Vitamin C Brightening Powder", category: "Supplements", price: 64, image: "/images/nutrition.avif" },
  { slug: "lymphatic-dry-brush-set", title: "Lymphatic Dry Brush Set", category: "Recovery", price: 42, image: "/images/icoone.avif" },
  { slug: "hydration-mineral-drops", title: "Hydration Mineral Drops", category: "Nutrition", price: 38, image: "/images/wellness.avif" },
  { slug: "overnight-barrier-repair-cream", title: "Overnight Barrier Repair Cream", category: "Skincare", price: 118, image: "/images/esthetics.avif" },
];

function orderNumber(n) {
  return `KP-2026-${String(n).padStart(4, "0")}`;
}

async function upsertUsers() {
  const users = {};
  for (const entry of demoUsers) {
    const passwordHash = await bcrypt.hash(entry.password, 12);
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: { name: entry.name, role: entry.role, passwordHash },
      create: { name: entry.name, email: entry.email, role: entry.role, passwordHash },
    });
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: { tier: SubscriptionTier.PREMIUM, status: SubscriptionStatus.ACTIVE },
      create: { userId: user.id, tier: SubscriptionTier.PREMIUM, status: SubscriptionStatus.ACTIVE },
    });
    users[entry.email] = user;
  }
  return users;
}

async function upsertProducts() {
  const products = {};
  for (const product of demoProducts) {
    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        category: product.category,
        price: product.price,
        status: ProductStatus.ACTIVE,
        featuredImage: product.image,
        inventoryQty: 250,
      },
      create: {
        slug: product.slug,
        title: product.title,
        description: `${product.title} by KIAN Prive`,
        category: product.category,
        price: product.price,
        status: ProductStatus.ACTIVE,
        featuredImage: product.image,
        inventoryQty: 250,
      },
    });
    products[product.slug] = row;
  }
  return products;
}

async function upsertOrders(users, products) {
  const ordersData = [
    {
      orderNumber: orderNumber(1),
      user: users["sophia.client@kianprive.com"],
      itemSlugs: ["lymphatic-support-serum", "collagen-renewal-capsules"],
      status: OrderStatus.PAID,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    },
    {
      orderNumber: orderNumber(2),
      user: users["daniel.client@kianprive.com"],
      itemSlugs: ["metabolic-support-protein", "daily-recovery-electrolyte-blend", "hydration-mineral-drops"],
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    },
    {
      orderNumber: orderNumber(3),
      user: users["alyssa.client@kianprive.com"],
      itemSlugs: ["advanced-beauty-essentials-kit"],
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
    },
  ];

  for (const [idx, row] of ordersData.entries()) {
    const items = row.itemSlugs.map((slug) => {
      const p = products[slug];
      return {
        productId: p.id,
        title: p.title,
        quantity: 1,
        unitPrice: p.price,
        lineTotal: p.price,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const shipping = subtotal >= 150 ? 0 : 12;
    const total = subtotal + shipping;

    await prisma.order.upsert({
      where: { orderNumber: row.orderNumber },
      update: {
        userId: row.user.id,
        email: row.user.email,
        status: row.status,
        paymentStatus: row.paymentStatus,
        fulfillmentStatus: row.fulfillmentStatus,
        subtotal,
        shippingTotal: shipping,
        total,
        items: { deleteMany: {}, create: items },
        payments: {
          deleteMany: {},
          create: [
            {
              provider: "stripe",
              status: PaymentStatus.PAID,
              amount: total,
              currency: "USD",
            },
          ],
        },
        fulfillments: {
          deleteMany: {},
          create: [
            {
              status: row.fulfillmentStatus,
              carrier: "UPS",
              trackingNumber: `1ZDEMO${idx + 101}`,
              trackingUrl: "https://www.ups.com/track",
              shippedAt: new Date(),
              deliveredAt: row.fulfillmentStatus === FulfillmentStatus.DELIVERED ? new Date() : null,
              notes: "Demo seeded fulfillment",
            },
          ],
        },
      },
      create: {
        orderNumber: row.orderNumber,
        userId: row.user.id,
        email: row.user.email,
        status: row.status,
        paymentStatus: row.paymentStatus,
        fulfillmentStatus: row.fulfillmentStatus,
        currency: "USD",
        subtotal,
        shippingTotal: shipping,
        total,
        items: { create: items },
        payments: {
          create: [
            {
              provider: "stripe",
              status: PaymentStatus.PAID,
              amount: total,
              currency: "USD",
            },
          ],
        },
        fulfillments: {
          create: [
            {
              status: row.fulfillmentStatus,
              carrier: "UPS",
              trackingNumber: `1ZDEMO${idx + 101}`,
              trackingUrl: "https://www.ups.com/track",
              shippedAt: new Date(),
              deliveredAt: row.fulfillmentStatus === FulfillmentStatus.DELIVERED ? new Date() : null,
              notes: "Demo seeded fulfillment",
            },
          ],
        },
      },
    });
  }
}

async function seedBookings(users) {
  const emails = ["sophia.client@kianprive.com", "daniel.client@kianprive.com", "alyssa.client@kianprive.com"];
  await prisma.bookingRequest.deleteMany({ where: { email: { in: emails } } });

  await prisma.bookingRequest.createMany({
    data: [
      {
        userId: users["sophia.client@kianprive.com"].id,
        fullName: "Sophia Client",
        email: "sophia.client@kianprive.com",
        phone: "305-555-0101",
        preferredDate: new Date(),
        preferredLocation: "In-Clinic",
        notes: "Focus on lymphatic drainage and recovery support",
        serviceIds: ["icoone-laser", "nutrition"],
        serviceTitles: ["Icoone Laser", "Nutrition"],
        guestTotal: 360,
        memberTotal: 288,
        status: BookingStatus.PENDING,
      },
      {
        userId: users["daniel.client@kianprive.com"].id,
        fullName: "Daniel Client",
        email: "daniel.client@kianprive.com",
        phone: "305-555-0102",
        preferredDate: new Date(Date.now() + 86400000),
        preferredLocation: "In-Home",
        notes: "Need evening slot and follow-up plan",
        serviceIds: ["telemedicine", "iv-therapy"],
        serviceTitles: ["Telemedicine", "IV Therapy"],
        guestTotal: 455,
        memberTotal: 364,
        status: BookingStatus.CONFIRMED,
      },
      {
        userId: users["alyssa.client@kianprive.com"].id,
        fullName: "Alyssa Client",
        email: "alyssa.client@kianprive.com",
        phone: "305-555-0103",
        preferredDate: new Date(Date.now() + 172800000),
        preferredLocation: "Virtual Consultation",
        notes: "Interested in aesthetics and peptide pathway education",
        serviceIds: ["facial-aesthetics", "glp1-peptides"],
        serviceTitles: ["Facial Aesthetics", "GLP-1s & Peptides"],
        guestTotal: 520,
        memberTotal: 416,
        status: BookingStatus.COMPLETED,
      },
    ],
  });
}

async function main() {
  const users = await upsertUsers();
  const products = await upsertProducts();
  await upsertOrders(users, products);
  await seedBookings(users);

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.bookingRequest.count(),
  ]);

  console.log("Demo data seeded.");
  console.log(`Users: ${counts[0]}, Products: ${counts[1]}, Orders: ${counts[2]}, Bookings: ${counts[3]}`);
  console.log("Demo customer logins:");
  console.log("- member@kianprive.com / KianPriv3!Demo");
  console.log("- sophia.client@kianprive.com / Client!234");
  console.log("- daniel.client@kianprive.com / Client!234");
  console.log("- alyssa.client@kianprive.com / Client!234");
  console.log("- admin@kianprive.com / KianPriv3!Admin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
