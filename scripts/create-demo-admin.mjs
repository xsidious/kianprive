import bcrypt from "bcryptjs";
import { PrismaClient, Role, SubscriptionStatus, SubscriptionTier } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@kianprive.com";
const ADMIN_PASSWORD = "KianPriv3!Admin";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "KIAN Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      name: "KIAN Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
    },
    create: {
      userId: user.id,
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  console.log("Demo admin user ready.");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
