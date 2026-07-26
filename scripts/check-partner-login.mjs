import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL host hint:", (process.env.DATABASE_URL || "").replace(/:[^:@/]+@/, ":****@"));
  const email = "partner.clinical@kianprive.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("USER_MISSING");
    return;
  }
  const ok = await bcrypt.compare("Partner!234", user.passwordHash || "");
  console.log("FOUND", user.role, "pwOk=", ok);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
