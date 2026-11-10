import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    where: {
      OR: [
        { email: { contains: "shuckerow" } },
        { email: { contains: "carmen.ramirez" } },
        { name: { contains: "Shuckerow" } },
        { name: { contains: "Carmen Ramirez" } },
      ],
    },
    select: {
      email: true,
      name: true,
      role: true,
      mustSetPassword: true,
      passwordHash: true,
      partnerProfile: {
        select: { displayName: true, status: true, type: true, partnerCode: true },
      },
    },
  });
  for (const u of users) {
    console.log(
      JSON.stringify({
        email: u.email,
        name: u.name,
        role: u.role,
        mustSetPassword: u.mustSetPassword,
        hasHash: Boolean(u.passwordHash),
        hashPrefix: u.passwordHash?.slice(0, 7),
        partner: u.partnerProfile,
      }),
    );
  }
  console.log("count", users.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
