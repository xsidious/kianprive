-- AlterTable
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "signatureDataUrl" TEXT;
ALTER TABLE "PartnerProfile" ADD COLUMN IF NOT EXISTS "signatureUpdatedAt" TIMESTAMP(3);
