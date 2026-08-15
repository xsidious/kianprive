-- LIVE-SAFE additive schema for imported client accounts + member onboarding.
-- Does NOT DROP, TRUNCATE, or DELETE.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "mustSetPassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "memberOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "setupTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "setupTokenExpires" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_setupTokenHash_key" ON "User"("setupTokenHash");

ALTER TABLE "Profile"
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT,
  ADD COLUMN IF NOT EXISTS "medicalConditions" TEXT,
  ADD COLUMN IF NOT EXISTS "allergies" TEXT,
  ADD COLUMN IF NOT EXISTS "medications" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "importedNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT;

-- Existing accounts that already have a password should not be forced through setup.
UPDATE "User"
SET "memberOnboardingComplete" = true,
    "mustSetPassword" = false
WHERE "passwordHash" IS NOT NULL;

