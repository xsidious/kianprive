import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: "PARTNER" },
    select: { email: true, role: true, passwordHash: true, partnerProfile: { select: { displayName: true, status: true, partnerCode: true } } },
  });
  console.log("partners:", users.length);
  for (const u of users) {
    const ok = u.passwordHash ? await bcrypt.compare("Partner!234", u.passwordHash) : false;
    console.log(u.email, u.partnerProfile?.displayName, u.partnerProfile?.status, "pwOk=", ok);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
