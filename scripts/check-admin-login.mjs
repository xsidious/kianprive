import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = "admin@kianprive.com";

const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    passwordHash: true,
    createdAt: true,
    updatedAt: true,
  },
});

if (!user) {
  console.log("RESULT: user_not_found");
  await prisma.$disconnect();
  process.exit(0);
}

console.log("RESULT: user_found");
console.log(JSON.stringify({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  hasPasswordHash: Boolean(user.passwordHash),
  passwordHashPrefix: user.passwordHash?.slice(0, 10) ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
}, null, 2));

const candidates = [
  "KianPriv3!Admin",
  "admin",
  "password",
  "KianPrive",
  "KianPrivé",
];

for (const password of candidates) {
  if (!user.passwordHash) continue;
  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log(`password_check "${password}": ${ok}`);
}

await prisma.$disconnect();
