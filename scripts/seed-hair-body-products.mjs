import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Upsert priced retail products into the shop catalog DB. */
const products = [
  {
    slug: "hair-serum",
    title: "Hair Serum",
    category: "Hair Care",
    price: 22,
    featuredImage: "/images/HairReatorationpicture.jpeg",
  },
  {
    slug: "shampoo",
    title: "Shampoo",
    category: "Hair Care",
    price: 15.5,
    featuredImage: "/images/hairrestoration.jpeg",
  },
  {
    slug: "conditioner",
    title: "Conditioner",
    category: "Hair Care",
    price: 15.5,
    featuredImage: "/images/hairrestoration.jpeg",
  },
  {
    slug: "co-wash-and-go",
    title: "Co-Wash and Go",
    category: "Hair Care",
    price: 15.5,
    featuredImage: "/images/hairrestoration.jpeg",
  },
  {
    slug: "body-wash",
    title: "Body Wash",
    category: "Body Care",
    price: 2,
    featuredImage: "/images/esthetics.avif",
  },
];

async function main() {
  for (const row of products) {
    const product = await prisma.product.upsert({
      where: { slug: row.slug },
      update: {
        title: row.title,
        category: row.category,
        price: row.price,
        featuredImage: row.featuredImage,
        status: "ACTIVE",
      },
      create: {
        slug: row.slug,
        title: row.title,
        description: `${row.title} by KIAN Privé`,
        category: row.category,
        price: row.price,
        featuredImage: row.featuredImage,
        status: "ACTIVE",
        inventoryQty: 250,
        currency: "USD",
      },
    });
    console.log(`${product.title} — $${Number(product.price).toFixed(2)} (${product.slug})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
