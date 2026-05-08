import { PrismaClient, ContentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.blogCategory.upsert({
    where: { slug: "beauty" },
    update: { name: "Beauty" },
    create: {
      slug: "beauty",
      name: "Beauty",
      description: "Beauty and skincare insights",
    },
  });

  const content = [
    "If you are looking for a simple but effective way to elevate your skincare routine, exfoliation is key. Many people invest in high-quality skincare products but do not realize that if there is a layer of dead skin blocking absorption, those products cannot perform as well as they should.",
    "Exfoliation helps remove surface buildup so your skin can better absorb serums, moisturizers, and treatment products.",
    "If you struggle with whiteheads, blackheads, clogged pores, or small breakouts, regular exfoliation can make a noticeable difference by reducing congestion before it turns into inflammation.",
    "Large pores often appear more visible when filled with oil and debris. Exfoliation removes that buildup so pores look cleaner and smoother.",
    "Exfoliation also supports a more even skin tone. Over time, it can help fade dark marks related to acne and sun exposure.",
    "For makeup wearers, exfoliation helps foundation and concealer apply more evenly and reduces patchy or cakey texture.",
    "As skin ages, natural cell turnover slows down. Exfoliation supports renewal so fresher skin cells appear at the surface more consistently.",
    "A practical routine is once per week for most skin types, and up to twice weekly for people who wear makeup often and tolerate exfoliation well.",
    "Over-exfoliation can damage the skin barrier and trigger irritation, dryness, and even more breakouts, so balance matters.",
    "Used correctly, exfoliation is one of the most effective habits for clearer texture, brighter tone, and healthier-looking skin.",
  ];

  const post = await prisma.blogPost.upsert({
    where: {
      slug: "putting-your-best-face-forward-the-power-of-exfoliation",
    },
    update: {
      title: "Putting Your Best Face Forward: The Power of Exfoliation",
      excerpt:
        "Why exfoliation improves skin clarity, tone, product absorption, and makeup finish, and how to do it safely.",
      content,
      status: ContentStatus.PUBLISHED,
      categoryId: category.id,
      readTime: "8 min read",
      featuredImage: "/images/facial-treatments.jpg",
      publishedAt: new Date(),
    },
    create: {
      slug: "putting-your-best-face-forward-the-power-of-exfoliation",
      title: "Putting Your Best Face Forward: The Power of Exfoliation",
      excerpt:
        "Why exfoliation improves skin clarity, tone, product absorption, and makeup finish, and how to do it safely.",
      content,
      status: ContentStatus.PUBLISHED,
      categoryId: category.id,
      readTime: "8 min read",
      featuredImage: "/images/facial-treatments.jpg",
      publishedAt: new Date(),
    },
  });

  console.log("Upserted blog post:", post.slug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
