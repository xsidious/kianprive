-- Repair schema drift on databases that predate Prisma migrations.
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS patterns).

-- Partner + role enums
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AMBASSADOR';
ALTER TYPE "PartnerType" ADD VALUE IF NOT EXISTS 'AMBASSADOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PROVIDER';
ALTER TYPE "IntakeSubmissionStatus" ADD VALUE IF NOT EXISTS 'NEEDS_LABS';

-- BookingRequest lab / medical review fields
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "patientDateOfBirth" TEXT;
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "labPrescriptionSentAt" TIMESTAMP(3);
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "medicalReviewPaidAt" TIMESTAMP(3);
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "medicalReviewTransId" TEXT;
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "medicalReviewAmount" DECIMAL(10,2);

-- Order ↔ intake link
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "intakeSubmissionId" TEXT;
CREATE INDEX IF NOT EXISTS "Order_intakeSubmissionId_idx" ON "Order"("intakeSubmissionId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_intakeSubmissionId_fkey'
  ) THEN
    ALTER TABLE "Order"
      ADD CONSTRAINT "Order_intakeSubmissionId_fkey"
      FOREIGN KEY ("intakeSubmissionId")
      REFERENCES "TherapeuticsIntakeSubmission"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

-- Analytics geo fields
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "region" TEXT;
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_country_occurredAt_idx" ON "AnalyticsEvent"("country", "occurredAt");
