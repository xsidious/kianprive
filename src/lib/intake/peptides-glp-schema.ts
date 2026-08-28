import { z } from "zod";
import { ACKNOWLEDGMENT_STATEMENTS } from "@/lib/intake/peptides-glp-options";

const yesNo = z.enum(["yes", "no"], { message: "Select yes or no." });
const requiredText = z.string().trim().min(1, "This field is required.");
const optionalText = z.string().trim().optional().default("");

const previousTherapyEntrySchema = z
  .object({
    therapy: z.string().min(1),
    dose: z.string().trim().default(""),
    duration: z.string().trim().default(""),
    reasonStopped: z.string().trim().default(""),
    sideEffects: z.string().trim().default(""),
  })
  .superRefine((entry, ctx) => {
    if (entry.therapy === "None of the above") return;
    (["dose", "duration", "reasonStopped", "sideEffects"] as const).forEach((key) => {
      if (!entry[key]?.trim()) {
        ctx.addIssue({ code: "custom", message: "Required.", path: [key] });
      }
    });
  });

export const peptidesGlpIntakeSchema = z.object({
  patient: z.object({
    fullName: z.string().trim().min(2, "Full name is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    age: z.string().trim().min(1, "Age is required."),
    height: z.string().trim().min(1, "Height is required."),
    weight: z.string().trim().min(1, "Weight is required."),
    bmi: z.string().trim().optional().default(""),
    sexAtBirth: z.enum(["Male", "Female"], { message: "Sex at birth is required." }),
    genderIdentity: optionalText,
    phone: z.string().trim().min(7, "Phone number is required."),
    email: z.string().trim().email("A valid email is required."),
    primaryCarePhysician: requiredText,
    referringPhysician: optionalText,
    firstAppointmentDate: optionalText,
  }),
  programs: z.array(z.string()).min(1, "Select at least one program of interest."),
  goals: z
    .object({
      primaryGoals: z.array(z.string()).min(1, "Select at least one treatment goal."),
      otherGoal: optionalText,
      desiredGoalWeight: requiredText,
      aestheticOutcomes: requiredText,
    })
    .superRefine((value, ctx) => {
      if (value.primaryGoals.includes("Other") && !value.otherGoal.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe your other goal.", path: ["otherGoal"] });
      }
    }),
  weightHistory: z.object({
    currentWeight: requiredText,
    highestAdultWeight: requiredText,
    lowestAdultWeight: requiredText,
    struggleDuration: requiredText,
    previousApproaches: z.array(z.string()).min(1, "Select at least one previous approach, or None of the above."),
    previousTherapies: z.array(previousTherapyEntrySchema).min(1, "Select previous therapies, or None of the above."),
    previousTherapyExperience: requiredText,
  }),
  medicalHistory: z
    .object({
      conditions: z.array(z.string()).min(1, "Select medical conditions, or None of the above."),
      hormonalDisorderDetail: optionalText,
      otherConditions: yesNo,
      otherConditionsDetail: optionalText,
      recentSurgery: yesNo,
      recentSurgeryDetail: optionalText,
      pregnantBreastfeedingPlanning: yesNo,
    })
    .superRefine((value, ctx) => {
      if (value.conditions.includes("Hormonal Disorder") && !value.hormonalDisorderDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe the hormonal disorder.", path: ["hormonalDisorderDetail"] });
      }
      if (value.otherConditions === "yes" && !value.otherConditionsDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Please specify.", path: ["otherConditionsDetail"] });
      }
      if (value.recentSurgery === "yes" && !value.recentSurgeryDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Please specify.", path: ["recentSurgeryDetail"] });
      }
    }),
  contraindications: z
    .object({
      items: z.array(z.string()).min(1, "Complete contraindication screening."),
      medicationAllergy: yesNo,
      medicationAllergyDetail: optionalText,
    })
    .superRefine((value, ctx) => {
      if (value.medicationAllergy === "yes" && !value.medicationAllergyDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe the reaction.", path: ["medicationAllergyDetail"] });
      }
    }),
  familyHistory: z.array(z.string()).min(1, "Select family history, or None of the above."),
  medications: z.object({
    prescriptions: requiredText,
    supplements: requiredText,
    peptidesInUse: requiredText,
    hormones: requiredText,
    medicationAllergies: requiredText,
    foodAllergies: requiredText,
    otherAllergies: requiredText,
  }),
  lifestyle: z
    .object({
      activityFrequency: requiredText,
      averageDailySteps: requiredText,
      averageSleepHours: requiredText,
      dietType: requiredText,
      otherDiet: optionalText,
      skincareRoutine: yesNo,
      skincareRoutineDetail: optionalText,
      alcoholOrSubstances: yesNo,
      alcoholOrSubstancesDetail: optionalText,
      smokingStatus: z.array(z.string()).min(1, "Select smoking status."),
      stressLevel: requiredText,
    })
    .superRefine((value, ctx) => {
      if (value.dietType === "Other" && !value.otherDiet.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe your diet.", path: ["otherDiet"] });
      }
      if (value.skincareRoutine === "yes" && !value.skincareRoutineDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe your routine.", path: ["skincareRoutineDetail"] });
      }
      if (value.alcoholOrSubstances === "yes" && !value.alcoholOrSubstancesDetail.trim()) {
        ctx.addIssue({ code: "custom", message: "Describe frequency and type.", path: ["alcoholOrSubstancesDetail"] });
      }
    }),
  nutrition: z.object({
    mealsPerDay: requiredText,
    waterIntakeOz: requiredText,
    proteinIntakeG: requiredText,
    eatingPatterns: z.array(z.string()).min(1, "Select eating patterns, or None of the above."),
  }),
  womensHealth: z.object({
    lastMenstrualPeriod: requiredText,
    birthControlMethod: requiredText,
    selections: z.array(z.string()).min(1, "Complete women's health, or None of the above / N/A."),
  }),
  labs: z.object({
    recentLabs: z.array(z.string()).min(1, "Select recent labs, or None on file."),
  }),
  symptoms: z.array(z.string()).min(1, "Select symptoms, or None of the above."),
  acknowledgments: z.object({
    initials: z
      .record(z.string())
      .refine(
        (value) => ACKNOWLEDGMENT_STATEMENTS.every((_, index) => Boolean(value[String(index)]?.trim())),
        "Initial each acknowledgment statement.",
      ),
  }),
  consent: z
    .object({
      accuracyTypedYes: z
        .string()
        .trim()
        .refine((value) => value.toLowerCase() === "yes", {
          message: "Type YES to confirm the information on this form is true and complete.",
        }),
      informedSafetyDiscussed: z.boolean().refine((value) => value === true, {
        message: "Confirm that safety information has been reviewed.",
      }),
      telemedicineAttestation: z.boolean().refine((value) => value === true, {
        message: "Telemedicine attestation is required.",
      }),
      informedConsent: z.boolean().refine((value) => value === true, {
        message: "Informed consent is required.",
      }),
      hipaaPrivacyAcknowledged: z.boolean().refine((value) => value === true, {
        message: "HIPAA privacy acknowledgment is required.",
      }),
      referralSource: z.string().min(1, "Please tell us how you heard about KIAN Privé."),
      referralOther: optionalText,
      clientSignature: z.string().trim().min(2, "Client signature is required."),
      signatureDate: z.string().min(1, "Signature date is required."),
      printedName: z.string().trim().min(2, "Printed name is required."),
    })
    .superRefine((value, ctx) => {
      if (value.referralSource === "Other" && !value.referralOther.trim()) {
        ctx.addIssue({ code: "custom", message: "Please specify.", path: ["referralOther"] });
      }
    }),
});

export type PeptidesGlpIntakeFormData = z.infer<typeof peptidesGlpIntakeSchema>;

export const peptidesGlpStepValidators = [
  peptidesGlpIntakeSchema.pick({ patient: true, programs: true, goals: true }),
  peptidesGlpIntakeSchema.pick({
    weightHistory: true,
    medicalHistory: true,
    contraindications: true,
    familyHistory: true,
    medications: true,
  }),
  peptidesGlpIntakeSchema.pick({
    lifestyle: true,
    nutrition: true,
    womensHealth: true,
    labs: true,
    symptoms: true,
  }),
  peptidesGlpIntakeSchema.pick({ acknowledgments: true, consent: true }),
] as const;

export const defaultPeptidesGlpIntake: PeptidesGlpIntakeFormData = {
  patient: {
    fullName: "",
    dateOfBirth: "",
    age: "",
    height: "",
    weight: "",
    bmi: "",
    sexAtBirth: "Female",
    genderIdentity: "",
    phone: "",
    email: "",
    primaryCarePhysician: "",
    referringPhysician: "",
    firstAppointmentDate: "",
  },
  programs: [],
  goals: {
    primaryGoals: [],
    otherGoal: "",
    desiredGoalWeight: "",
    aestheticOutcomes: "",
  },
  weightHistory: {
    currentWeight: "",
    highestAdultWeight: "",
    lowestAdultWeight: "",
    struggleDuration: "",
    previousApproaches: [],
    previousTherapies: [],
    previousTherapyExperience: "",
  },
  medicalHistory: {
    conditions: [],
    hormonalDisorderDetail: "",
    otherConditions: "no",
    otherConditionsDetail: "",
    recentSurgery: "no",
    recentSurgeryDetail: "",
    pregnantBreastfeedingPlanning: "no",
  },
  contraindications: {
    items: [],
    medicationAllergy: "no",
    medicationAllergyDetail: "",
  },
  familyHistory: [],
  medications: {
    prescriptions: "",
    supplements: "",
    peptidesInUse: "",
    hormones: "",
    medicationAllergies: "",
    foodAllergies: "",
    otherAllergies: "",
  },
  lifestyle: {
    activityFrequency: "",
    averageDailySteps: "",
    averageSleepHours: "",
    dietType: "",
    otherDiet: "",
    skincareRoutine: undefined as unknown as "yes" | "no",
    skincareRoutineDetail: "",
    alcoholOrSubstances: undefined as unknown as "yes" | "no",
    alcoholOrSubstancesDetail: "",
    smokingStatus: [],
    stressLevel: "",
  },
  nutrition: {
    mealsPerDay: "",
    waterIntakeOz: "",
    proteinIntakeG: "",
    eatingPatterns: [],
  },
  womensHealth: {
    lastMenstrualPeriod: "",
    birthControlMethod: "",
    selections: [],
  },
  labs: {
    recentLabs: [],
  },
  symptoms: [],
  acknowledgments: {
    initials: {},
  },
  consent: {
    accuracyTypedYes: "",
    informedSafetyDiscussed: false,
    telemedicineAttestation: false,
    informedConsent: false,
    hipaaPrivacyAcknowledged: false,
    referralSource: "",
    referralOther: "",
    clientSignature: "",
    signatureDate: "",
    printedName: "",
  },
};
