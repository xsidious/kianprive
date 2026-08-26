import { z } from "zod";
import {
  CELEXO_CONSENT_STATEMENTS,
  CELEXO_SCREENING_QUESTIONS,
} from "@/lib/intake/celexo-options";

const yesNo = z.enum(["yes", "no"], { message: "Select yes or no." });
const requiredText = z.string().trim().min(1, "This field is required.");
const optionalText = z.string().trim().optional().default("");

const screeningShape = Object.fromEntries(
  CELEXO_SCREENING_QUESTIONS.map((q) => [
    q.key,
    z.object({
      answer: yesNo,
      details: optionalText,
    }),
  ]),
) as Record<
  (typeof CELEXO_SCREENING_QUESTIONS)[number]["key"],
  z.ZodObject<{ answer: typeof yesNo; details: z.ZodDefault<z.ZodOptional<z.ZodString>> }>
>;

export const celexoIntakeSchema = z.object({
  source: z.literal("celexo-exosome"),
  patient: z.object({
    fullName: z.string().trim().min(2, "Full name is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    gender: requiredText,
    preferredPronouns: optionalText,
    phone: z.string().trim().min(7, "Phone number is required."),
    email: z.string().trim().email("A valid email is required."),
    address: requiredText,
    cityStateZip: requiredText,
    referringProvider: optionalText,
    visitDate: optionalText,
  }),
  selection: z
    .object({
      protocol: z.enum(["CELEXO — Plant-Based", "CELEXO BLACK LABEL — Adipose"], {
        message: "Select a Celexo protocol.",
      }),
      deliveryMethod: z.enum(["Topical Application", "Microneedling + Celexo"], {
        message: "Select a delivery method.",
      }),
      treatmentAreas: z.array(z.string()).min(1, "Select at least one treatment area."),
      otherTreatmentArea: optionalText,
      primaryGoals: z
        .array(z.object({ goal: z.string(), rank: z.number().int().min(1).max(3) }))
        .min(1, "Rank at least one primary goal.")
        .max(3),
      otherGoal: optionalText,
    })
    .superRefine((value, ctx) => {
      if (value.primaryGoals.some((g) => g.goal === "Other") && !value.otherGoal.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe your other goal.", path: ["otherGoal"] });
      }
    }),
  skin: z.object({
    skinType: requiredText,
    fitzpatrick: requiredText,
    primaryConcern: requiredText,
    currentRegimen: requiredText,
    activeConditions: z.array(z.string()).min(1, "Select active skin conditions, or None / Other."),
    recentTreatments: z.array(z.string()).min(1, "Select recent treatments, or None."),
    recentTreatmentDetails: optionalText,
  }),
  medical: z.object({
    conditions: z.array(z.string()).min(1, "Select medical conditions, or None of the above."),
    otherConditions: optionalText,
    medications: requiredText,
  }),
  allergies: z
    .object({
      items: z.array(z.string()).min(1, "Select allergies, or None Known."),
      specify: optionalText,
      screening: z.object(screeningShape),
    })
    .superRefine((value, ctx) => {
      for (const q of CELEXO_SCREENING_QUESTIONS) {
        const row = value.screening[q.key];
        if (row?.answer === "yes" && !row.details?.trim() && q.key !== "firstMicroneedling") {
          ctx.addIssue({
            code: "custom",
            message: "Please add details.",
            path: ["screening", q.key, "details"],
          });
        }
      }
    }),
  lifestyle: z.object({
    sunExposure: requiredText,
    spfUse: requiredText,
    diet: requiredText,
    waterIntake: requiredText,
    stressLevel: requiredText,
    sleepQuality: requiredText,
    exercise: requiredText,
    smoking: requiredText,
    alcohol: requiredText,
    supplementsActives: optionalText,
  }),
  consent: z
    .object({
      acknowledgments: z.array(z.string()),
      signatureDataUrl: z.string().min(20, "Signature is required."),
      printedName: requiredText,
      signatureDate: requiredText,
      guardianName: optionalText,
      guardianRelationship: optionalText,
    })
    .superRefine((value, ctx) => {
      for (const statement of CELEXO_CONSENT_STATEMENTS) {
        if (!value.acknowledgments.includes(statement)) {
          ctx.addIssue({
            code: "custom",
            message: "Please confirm all consent statements.",
            path: ["acknowledgments"],
          });
          break;
        }
      }
    }),
});

export type CelexoIntakeFormData = z.infer<typeof celexoIntakeSchema>;

const emptyScreening = Object.fromEntries(
  CELEXO_SCREENING_QUESTIONS.map((q) => [q.key, { answer: "" as "" | "yes" | "no", details: "" }]),
);

export const defaultCelexoIntake = {
  source: "celexo-exosome" as const,
  patient: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    preferredPronouns: "",
    phone: "",
    email: "",
    address: "",
    cityStateZip: "",
    referringProvider: "",
    visitDate: "",
  },
  selection: {
    protocol: "" as "" | "CELEXO — Plant-Based" | "CELEXO BLACK LABEL — Adipose",
    deliveryMethod: "" as "" | "Topical Application" | "Microneedling + Celexo",
    treatmentAreas: [] as string[],
    otherTreatmentArea: "",
    primaryGoals: [] as Array<{ goal: string; rank: number }>,
    otherGoal: "",
  },
  skin: {
    skinType: "",
    fitzpatrick: "",
    primaryConcern: "",
    currentRegimen: "",
    activeConditions: [] as string[],
    recentTreatments: [] as string[],
    recentTreatmentDetails: "",
  },
  medical: {
    conditions: [] as string[],
    otherConditions: "",
    medications: "",
  },
  allergies: {
    items: [] as string[],
    specify: "",
    screening: emptyScreening as Record<string, { answer: "" | "yes" | "no"; details: string }>,
  },
  lifestyle: {
    sunExposure: "",
    spfUse: "",
    diet: "",
    waterIntake: "",
    stressLevel: "",
    sleepQuality: "",
    exercise: "",
    smoking: "",
    alcohol: "",
    supplementsActives: "",
  },
  consent: {
    acknowledgments: [] as string[],
    signatureDataUrl: "",
    printedName: "",
    signatureDate: new Date().toISOString().slice(0, 10),
    guardianName: "",
    guardianRelationship: "",
  },
};

export const celexoStepValidators = [
  celexoIntakeSchema.pick({ patient: true }),
  celexoIntakeSchema.pick({ selection: true }),
  celexoIntakeSchema.pick({ skin: true }),
  celexoIntakeSchema.pick({ medical: true }),
  celexoIntakeSchema.pick({ allergies: true }),
  celexoIntakeSchema.pick({ lifestyle: true }),
  celexoIntakeSchema.pick({ consent: true }),
] as const;
