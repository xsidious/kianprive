import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const total = await p.product.count({ where: { source: "RXHERE" } });
  const vendor = await p.vendor.findFirst({ where: { name: "RxHere" } });
  if (!vendor) throw new Error("RxHere vendor missing");
  const offers = await p.productVendorOffer.count({ where: { vendorId: vendor.id } });
  const samples = await p.product.findMany({
    where: { source: "RXHERE", title: { contains: "GLP" } },
    take: 10,
    select: { title: true, sku: true, wholesalePrice: true, category: true },
    orderBy: { title: "asc" },
  });
  const bad = await p.product.count({
    where: {
      source: "RXHERE",
      OR: [
        { title: { contains: "Semaglutide", mode: "insensitive" } },
        { title: { contains: "Tirzepatide", mode: "insensitive" } },
        { title: { contains: "Retatrutide", mode: "insensitive" } },
      ],
    },
  });
  console.log({ total, offers, vendorEmail: vendor.email, brandNameLeftovers: bad });
  for (const s of samples) {
    console.log(`- ${s.sku} | ${s.title} | $${s.wholesalePrice} | ${s.category}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
