-- PartnerProfile.userId was a unique index, not a table constraint.
-- Dropping the index keeps every existing profile row and allows
-- one login to hold a partner, ambassador, and practitioner profile.
DROP INDEX IF EXISTS "PartnerProfile_userId_key";
