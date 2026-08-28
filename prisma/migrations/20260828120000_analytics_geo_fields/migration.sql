-- Analytics geo fields (page view location tracking)
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "AnalyticsEvent" ADD COLUMN IF NOT EXISTS "region" TEXT;
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_country_occurredAt_idx" ON "AnalyticsEvent"("country", "occurredAt");
