const NONE_OF_THE_ABOVE = /^none(\s+of\s+the\s+above|\s*\/\s*other)?$/i;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function listed(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function otherCondition(flag: unknown, detail: unknown) {
  const answer = typeof flag === "string" ? flag.trim() : "";
  const extra = typeof detail === "string" ? detail.trim() : "";
  if (!answer || /^no$/i.test(answer) || NONE_OF_THE_ABOVE.test(answer)) return "";
  if (/^yes$/i.test(answer)) return extra || "Other pre-existing medical condition";
  return answer;
}

/** Conditions a patient actually reported. "None of the above" does not count. */
export function reportedMedicalConditions(payload: unknown) {
  const root = asRecord(payload) ?? {};
  const history = asRecord(root.medicalHistory) ?? asRecord(root.medical) ?? root;
  const found: string[] = [];
  const add = (label: string) => {
    const clean = label.trim();
    if (!clean || NONE_OF_THE_ABOVE.test(clean)) return;
    if (found.some((item) => item.toLowerCase() === clean.toLowerCase())) return;
    found.push(clean);
  };

  for (const item of listed(history.conditions ?? root.conditions)) add(item);
  const other = otherCondition(
    history.otherConditions ?? root.otherConditions,
    history.otherConditionsDetail ?? root.otherConditionsDetail,
  );
  if (other) add(other);

  const screening = root.contraindications;
  const screeningRecord = asRecord(screening);
  for (const item of listed(screeningRecord ? screeningRecord.items : screening)) add(item);

  return found;
}

export function physicianReviewForConditions(payload: unknown) {
  const conditions = reportedMedicalConditions(payload);
  if (!conditions.length) {
    return {
      status: "PENDING_REVIEW" as const,
      statusNote: null,
      conditions,
    };
  }
  const listedConditions = conditions.slice(0, 12).join(", ");
  const more = conditions.length > 12 ? ` (+${conditions.length - 12} more)` : "";
  return {
    status: "UNDER_PHYSICIAN_REVIEW" as const,
    statusNote: `Automatically placed under physician review because medical conditions were reported: ${listedConditions}${more}.`,
    conditions,
  };
}
