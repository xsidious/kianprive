-- Provider chart: booking source + longitudinal notes/files
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "source" TEXT DEFAULT 'patient';

CREATE TYPE "ChartNoteVisibility" AS ENUM ('CLINICAL', 'CLIENT');
CREATE TYPE "PatientFileVisibility" AS ENUM ('CLINICAL', 'CLIENT');

CREATE TABLE IF NOT EXISTS "PatientChartNote" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "patientUserId" TEXT,
    "visibility" "ChartNoteVisibility" NOT NULL,
    "body" TEXT NOT NULL,
    "intakeSubmissionId" TEXT,
    "bookingId" TEXT,
    "authorUserId" TEXT,
    "authorPartnerId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PatientChartNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PatientFile" (
    "id" TEXT NOT NULL,
    "patientEmail" TEXT NOT NULL,
    "patientUserId" TEXT,
    "visibility" "PatientFileVisibility" NOT NULL DEFAULT 'CLINICAL',
    "fileName" TEXT,
    "mimeType" TEXT,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "intakeSubmissionId" TEXT,
    "bookingId" TEXT,
    "partnerId" TEXT,
    "uploadedByUserId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PatientFile_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PatientChartNote_patientEmail_visibility_createdAt_idx" ON "PatientChartNote"("patientEmail", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientChartNote_patientUserId_visibility_createdAt_idx" ON "PatientChartNote"("patientUserId", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientChartNote_authorPartnerId_createdAt_idx" ON "PatientChartNote"("authorPartnerId", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientChartNote_intakeSubmissionId_idx" ON "PatientChartNote"("intakeSubmissionId");
CREATE INDEX IF NOT EXISTS "PatientChartNote_bookingId_idx" ON "PatientChartNote"("bookingId");

CREATE INDEX IF NOT EXISTS "PatientFile_patientEmail_visibility_createdAt_idx" ON "PatientFile"("patientEmail", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientFile_patientUserId_visibility_createdAt_idx" ON "PatientFile"("patientUserId", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientFile_partnerId_createdAt_idx" ON "PatientFile"("partnerId", "createdAt");
CREATE INDEX IF NOT EXISTS "PatientFile_intakeSubmissionId_idx" ON "PatientFile"("intakeSubmissionId");
CREATE INDEX IF NOT EXISTS "PatientFile_bookingId_idx" ON "PatientFile"("bookingId");
