"use client";

type Section = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

function displayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    if (value.every((item) => typeof item === "string" || typeof item === "number")) {
      return value.map(String).join(", ");
    }
    return value
      .map((item, index) => {
        if (item && typeof item === "object") {
          return Object.entries(item as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${displayValue(v)}`)
            .join("; ");
        }
        return `${index + 1}. ${displayValue(item)}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${displayValue(v)}`)
      .join("; ");
  }
  return String(value);
}

function pick(obj: Record<string, unknown> | null | undefined, path: string): unknown {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function rowsFromPairs(
  source: Record<string, unknown> | null | undefined,
  pairs: Array<[string, string]>,
): Array<{ label: string; value: string }> {
  return pairs.map(([label, path]) => ({
    label,
    value: displayValue(pick(source ?? undefined, path)),
  }));
}

function isPeptidesPayload(payload: Record<string, unknown> | null | undefined) {
  if (!payload) return false;
  if (payload.source === "wellness-hub") return false;
  return Boolean(payload.patient || payload.programs || payload.medicalHistory || payload.goals);
}

function buildWellnessSections(
  submission: Record<string, unknown>,
  payload: Record<string, unknown> | null,
): Section[] {
  const merged = { ...payload, ...submission };
  const sections: Array<{ title: string; fields: [string, string][] }> = [
    {
      title: "Patient",
      fields: [
        ["Full name", "fullName"],
        ["Date of birth", "dateOfBirth"],
        ["Age", "age"],
        ["Sex at birth", "sexAtBirth"],
        ["Phone", "phone"],
        ["Email", "email"],
        ["Address", "address"],
        ["ID number", "idNumber"],
        ["ID issue place", "idIssuePlace"],
        ["Primary care physician", "primaryCarePhysician"],
        ["First appointment", "firstAppointmentDate"],
        ["Assigned provider", "assignedProvider"],
        ["Referred by", "referredBy"],
      ],
    },
    {
      title: "Medications & allergies",
      fields: [
        ["Prescription medications", "prescriptionMedications"],
        ["Supplements & peptides", "supplementsPeptides"],
        ["Medication allergies", "medicationAllergies"],
        ["Food allergies", "foodAllergies"],
        ["Other allergies", "otherAllergies"],
      ],
    },
    {
      title: "History",
      fields: [
        ["Conditions", "conditions"],
        ["Other conditions", "otherConditions"],
        ["Recent surgeries", "recentSurgeries"],
        ["Pregnant / breastfeeding", "pregnantBreastfeeding"],
        ["Last physical (year/month)", "lastPhysicalDate"],
        ["Last bloodwork (year/month)", "lastBloodworkDate"],
        ["Bloodwork within normal limits", "bloodworkWithinNormalLimits"],
      ],
    },
    {
      title: "GLP / peptide context",
      fields: [
        ["GLP medications", "glpMedications"],
        ["GLP dose", "glpDose"],
        ["GLP duration", "glpDuration"],
        ["Reason stopped", "glpReasonStopped"],
        ["Side effects", "glpSideEffects"],
        ["Contraindications", "contraindications"],
        ["Family MTC / MEN2", "familyMtcMen2"],
        ["Allergic reaction", "allergicReactionAny"],
        ["Allergic reaction details", "allergicReactionDetails"],
      ],
    },
    {
      title: "Notes & signatures",
      fields: [
        ["Scheduling status", "requestedDate"],
        ["Preferred time", "requestedTime"],
        ["Discussion notes", "schedulingNotes"],
        ["Attestation name", "attestationName"],
        ["Attestation date", "attestationDate"],
      ],
    },
  ];

  return sections.map((section) => ({
    title: section.title,
    rows: rowsFromPairs(merged, section.fields),
  }));
}

function buildPeptidesSections(payload: Record<string, unknown>): Section[] {
  return [
    {
      title: "01 Patient information",
      rows: rowsFromPairs(payload, [
        ["Full name", "patient.fullName"],
        ["Date of birth", "patient.dateOfBirth"],
        ["Age", "patient.age"],
        ["Height", "patient.height"],
        ["Weight", "patient.weight"],
        ["BMI", "patient.bmi"],
        ["Sex at birth", "patient.sexAtBirth"],
        ["Gender identity", "patient.genderIdentity"],
        ["Phone", "patient.phone"],
        ["Email", "patient.email"],
        ["Primary care physician", "patient.primaryCarePhysician"],
        ["Referring physician", "patient.referringPhysician"],
        ["First appointment", "patient.firstAppointmentDate"],
      ]),
    },
    {
      title: "02 Program of interest",
      rows: rowsFromPairs(payload, [["Programs", "programs"]]),
    },
    {
      title: "03 Treatment goals",
      rows: rowsFromPairs(payload, [
        ["Primary goals", "goals.primaryGoals"],
        ["Other goal", "goals.otherGoal"],
        ["Desired goal weight", "goals.desiredGoalWeight"],
        ["Aesthetic / wellness outcomes", "goals.aestheticOutcomes"],
      ]),
    },
    {
      title: "04 Weight & metabolic history",
      rows: rowsFromPairs(payload, [
        ["Current weight", "weightHistory.currentWeight"],
        ["Highest adult weight", "weightHistory.highestAdultWeight"],
        ["Lowest adult weight", "weightHistory.lowestAdultWeight"],
        ["Struggle duration", "weightHistory.struggleDuration"],
        ["Previous approaches", "weightHistory.previousApproaches"],
        ["Previous therapies", "weightHistory.previousTherapies"],
        ["Previous therapy experience", "weightHistory.previousTherapyExperience"],
      ]),
    },
    {
      title: "05 Medical history",
      rows: rowsFromPairs(payload, [
        ["Conditions", "medicalHistory.conditions"],
        ["Other conditions", "medicalHistory.otherConditions"],
        ["Surgeries", "medicalHistory.surgeries"],
        ["Hospitalizations", "medicalHistory.hospitalizations"],
        ["Family history", "medicalHistory.familyHistory"],
        ["Pregnant / breastfeeding", "medicalHistory.pregnantBreastfeeding"],
      ]),
    },
    {
      title: "06 Medications & allergies",
      rows: rowsFromPairs(payload, [
        ["Current medications", "medications.currentMedications"],
        ["Peptides in use", "medications.peptidesInUse"],
        ["Supplements", "medications.supplements"],
        ["Drug allergies", "medications.drugAllergies"],
        ["Food allergies", "medications.foodAllergies"],
        ["Other allergies", "medications.otherAllergies"],
      ]),
    },
    {
      title: "07 Lifestyle",
      rows: rowsFromPairs(payload, [
        ["Activity level", "lifestyle.activityLevel"],
        ["Exercise types", "lifestyle.exerciseTypes"],
        ["Diet pattern", "lifestyle.dietPattern"],
        ["Alcohol", "lifestyle.alcohol"],
        ["Tobacco", "lifestyle.tobacco"],
        ["Sleep hours", "lifestyle.sleepHours"],
        ["Stress level", "lifestyle.stressLevel"],
        ["Notes", "lifestyle.notes"],
      ]),
    },
    {
      title: "08 Labs & diagnostics",
      rows: rowsFromPairs(payload, [
        ["Recent labs", "labs.recentLabs"],
        ["Lab date", "labs.labDate"],
        ["Lab facility", "labs.labFacility"],
        ["Abnormal findings", "labs.abnormalFindings"],
        ["Requested panels", "labs.requestedPanels"],
        ["Notes", "labs.notes"],
      ]),
    },
    {
      title: "09 Acknowledgments",
      rows: rowsFromPairs(payload, [
        ["Acknowledgments", "acknowledgments"],
        ["Attestation name", "attestationName"],
        ["Attestation date", "attestationDate"],
        ["Additional notes", "additionalNotes"],
      ]),
    },
  ];
}

function buildFallbackSections(payload: Record<string, unknown> | null): Section[] {
  if (!payload) return [];
  const skip = new Set(["clientSignatureDataUrl", "providerSignatureDataUrl"]);
  return [
    {
      title: "Full submission data",
      rows: Object.entries(payload)
        .filter(([key]) => !skip.has(key))
        .map(([key, value]) => ({
          label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
          value: displayValue(value),
        })),
    },
  ];
}

type Props = {
  submission: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    referredBy?: string | null;
    status?: string | null;
    [key: string]: unknown;
  };
  payload?: Record<string, unknown> | null;
  className?: string;
};

export function IntakeFullFormView({ submission, payload, className }: Props) {
  const record = submission as Record<string, unknown>;
  const sections = isPeptidesPayload(payload)
    ? buildPeptidesSections(payload!)
    : payload || record
      ? [
          ...buildWellnessSections(record, payload ?? null),
          // If wellness sections are all empty but payload has nested keys, also show fallback
        ]
      : [];

  const wellnessEmpty =
    !isPeptidesPayload(payload) &&
    sections.every((section) => section.rows.every((row) => row.value === "—"));

  const finalSections =
    isPeptidesPayload(payload)
      ? sections
      : wellnessEmpty
        ? buildFallbackSections(payload ?? null)
        : sections;

  return (
    <div className={className ?? "space-y-4"}>
      <div className="rounded-2xl border border-[#efe4d4] bg-[#fffaf3] p-4">
        <h3 className="font-serif text-lg text-[#1f1a15]">Full intake form</h3>
        <p className="mt-1 text-sm text-[#6f6251]">
          Complete submission packet for clinical review
          {isPeptidesPayload(payload) ? " (site peptides / GLP intake)." : " (Wellness Hub / flat intake)."}
        </p>
      </div>

      {finalSections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-[#efe4d4] bg-white p-4">
          <h3 className="font-serif text-lg text-[#1f1a15]">{section.title}</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {section.rows.map((row) => (
              <div key={`${section.title}-${row.label}`} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">{row.label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-[#2b2218]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
