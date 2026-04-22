import bcrypt from "bcryptjs";
import { PrismaClient, Role, SubscriptionStatus, SubscriptionTier } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "member@kianprive.com";
const DEMO_PASSWORD = "KianPriv3!Demo";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "KIAN Demo Member",
      passwordHash,
      role: Role.MEMBER,
    },
    create: {
      name: "KIAN Demo Member",
      email: DEMO_EMAIL,
      passwordHash,
      role: Role.MEMBER,
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    create: {
      userId: user.id,
      tier: SubscriptionTier.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  console.log("Demo user ready.");
  console.log(`Email: ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
