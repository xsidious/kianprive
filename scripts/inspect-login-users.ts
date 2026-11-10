import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    where: {
      OR: [
        { email: { contains: "alex", mode: "insensitive" } },
        { email: { contains: "bella", mode: "insensitive" } },
        { email: { contains: "isabella", mode: "insensitive" } },
        { email: { contains: "lucas", mode: "insensitive" } },
        { email: { contains: "shane", mode: "insensitive" } },
        { email: { contains: "carmen", mode: "insensitive" } },
        { name: { contains: "Shuckerow", mode: "insensitive" } },
      ],
    },
    select: {
      email: true,
      name: true,
      role: true,
      mustSetPassword: true,
      passwordHash: true,
      partnerProfile: { select: { displayName: true, status: true, type: true, partnerCode: true } },
    },
    orderBy: { email: "asc" },
  });
  for (const u of users) {
    console.log(
      [
        u.email,
        u.name,
        u.role,
        `mustSet=${u.mustSetPassword}`,
        `hash=${u.passwordHash ? u.passwordHash.slice(0, 7) : "NONE"}`,
        u.partnerProfile
          ? `${u.partnerProfile.type}/${u.partnerProfile.status}/${u.partnerProfile.partnerCode}`
          : "no-partner",
      ].join(" | "),
    );
  }
  console.log("total", users.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
