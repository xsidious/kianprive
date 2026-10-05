-- One login can hold a partner profile, an ambassador profile, and a practitioner profile.
ALTER TABLE "PartnerProfile" DROP CONSTRAINT IF EXISTS "PartnerProfile_userId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerProfile_userId_type_key" ON "PartnerProfile"("userId", "type");
CREATE INDEX IF NOT EXISTS "PartnerProfile_userId_idx" ON "PartnerProfile"("userId");
