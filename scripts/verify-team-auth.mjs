/**
 * Simulate NextAuth credentials authorize() for team accounts.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const trials = [
  ["carmen.ramirez@kianprive.com", "Cadasil8@$"],
  ["carmenramirezmd@yahoo.com", "Cadasil8@$"],
  ["shane.shuckerow@kianprive.com", "Steeler$3030"],
  ["alexander.shuckerow@kianprive.com", "Cosmo0219$!"],
  ["alex.shuckerow@kianprive.com", "Cosmo0219$!"],
  ["lucas.shuckerow@kianprive.com", "3Burrito0109$"],
  ["lucasshuckerow@gmail.com", "3Burrito0109$"],
  ["isabella.shuckerow@kianprive.com", "Justice212$"],
  ["bella.shuckerow@kianprive.com", "Justice212$"],
  // wrong password should fail
  ["shane.shuckerow@kianprive.com", "wrong-password"],
];

async function authorize(email, password) {
  const parsed = credentialsSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false, reason: "schema" };
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user?.passwordHash) return { ok: false, reason: "no-hash" };
  if (user.mustSetPassword) return { ok: false, reason: "must-set-password-flag-but-auth-still-allows" };
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return { ok: false, reason: "bad-password", role: user.role };
  return { ok: true, role: user.role, mustSetPassword: user.mustSetPassword };
}

async function main() {
  for (const [email, password] of trials) {
    const result = await authorize(email, password);
    console.log(`${result.ok ? "PASS" : "FAIL"} ${email} → ${JSON.stringify(result)}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
