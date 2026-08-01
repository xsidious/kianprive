-- Intake tracking + order link + NEEDS_LABS status
ALTER TYPE "IntakeSubmissionStatus" ADD VALUE IF NOT EXISTS 'NEEDS_LABS';

ALTER TABLE "TherapeuticsIntakeSubmission"
  ADD COLUMN IF NOT EXISTS "statusNote" TEXT,
  ADD COLUMN IF NOT EXISTS "publicTrackingToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "TherapeuticsIntakeSubmission_publicTrackingToken_key"
  ON "TherapeuticsIntakeSubmission"("publicTrackingToken");

CREATE INDEX IF NOT EXISTS "TherapeuticsIntakeSubmission_userId_createdAt_idx"
  ON "TherapeuticsIntakeSubmission"("userId", "createdAt");

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "intakeSubmissionId" TEXT;

CREATE INDEX IF NOT EXISTS "Order_intakeSubmissionId_idx"
  ON "Order"("intakeSubmissionId");

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
