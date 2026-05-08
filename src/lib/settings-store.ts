import { prisma } from "@/lib/prisma";

export async function getSettingValue<T = unknown>(key: string, fallback: T): Promise<T> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } }).catch(() => null);
  return (setting?.value as T) ?? fallback;
}
