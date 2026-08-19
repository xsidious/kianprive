import { PrismaClient, ProductCatalogKind, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: "payment-test-1" },
    update: {
      title: "Payment Test ($1)",
      description:
        "Temporary $1.00 item for verifying live checkout. Currently archived.",
      status: ProductStatus.ARCHIVED,
      category: "Nutrients",
      catalogKind: ProductCatalogKind.RETAIL,
      isPrescription: false,
      price: 1,
      featuredImage: "/images/wellness.avif",
      inventoryQty: 100,
      trackInventory: false,
      sku: "PAY-TEST-1",
    },
    create: {
      slug: "payment-test-1",
      title: "Payment Test ($1)",
      description:
        "Temporary $1.00 item for verifying live checkout. Remove after payment testing is complete.",
      status: ProductStatus.ACTIVE,
      category: "Nutrients",
      catalogKind: ProductCatalogKind.RETAIL,
      isPrescription: false,
      price: 1,
      featuredImage: "/images/wellness.avif",
      inventoryQty: 100,
      trackInventory: false,
      sku: "PAY-TEST-1",
    },
  });
  console.log("Upserted:", product.slug, product.id, Number(product.price));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
