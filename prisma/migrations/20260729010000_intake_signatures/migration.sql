-- AlterTable
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "clientSignatureDataUrl" TEXT;
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "providerSignatureDataUrl" TEXT;
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "providerSignedAt" TIMESTAMP(3);
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "providerSignedName" TEXT;
ALTER TABLE "TherapeuticsIntakeSubmission" ADD COLUMN IF NOT EXISTS "assignedPartnerId" TEXT;

CREATE INDEX IF NOT EXISTS "TherapeuticsIntakeSubmission_assignedPartnerId_createdAt_idx"
  ON "TherapeuticsIntakeSubmission"("assignedPartnerId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'TherapeuticsIntakeSubmission_assignedPartnerId_fkey'
  ) THEN
    ALTER TABLE "TherapeuticsIntakeSubmission"
      ADD CONSTRAINT "TherapeuticsIntakeSubmission_assignedPartnerId_fkey"
      FOREIGN KEY ("assignedPartnerId") REFERENCES "PartnerProfile"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
