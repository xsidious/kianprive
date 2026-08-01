-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "IntakeMessageAuthor" AS ENUM ('PROVIDER', 'PATIENT', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "IntakeMessage" (
    "id" TEXT NOT NULL,
    "intakeSubmissionId" TEXT NOT NULL,
    "authorRole" "IntakeMessageAuthor" NOT NULL,
    "authorUserId" TEXT,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntakeMessage_intakeSubmissionId_createdAt_idx"
  ON "IntakeMessage"("intakeSubmissionId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "IntakeMessage"
    ADD CONSTRAINT "IntakeMessage_intakeSubmissionId_fkey"
    FOREIGN KEY ("intakeSubmissionId") REFERENCES "TherapeuticsIntakeSubmission"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
