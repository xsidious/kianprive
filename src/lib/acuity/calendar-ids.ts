/** Acuity schedule columns (from GET /calendars). */
export const ACUITY_CALENDAR = {
  FACIAL_DESIGN: 12244579,
  SPA: 4895252,
  ADAPT: 10572334,
  NANCY: 13225506,
  TOTAL_BODY: 4897308,
  REIKI: 7956825,
} as const;

export const ACUITY_CALENDAR_LABELS: Record<number, string> = {
  [ACUITY_CALENDAR.FACIAL_DESIGN]: "Facial Design Studio",
  [ACUITY_CALENDAR.SPA]: "KIAN Beauty & Spa Treatments",
  [ACUITY_CALENDAR.ADAPT]: "KIAN Beauty & Wellness @ Adapt",
  [ACUITY_CALENDAR.NANCY]: "KIAN Beauty & Wellness w Nancy",
  [ACUITY_CALENDAR.TOTAL_BODY]: "KIAN Total Body Wellness",
  [ACUITY_CALENDAR.REIKI]: "Reiki Therapy",
};
