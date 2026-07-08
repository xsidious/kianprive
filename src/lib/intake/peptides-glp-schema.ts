import { z } from "zod";
import { ACKNOWLEDGMENT_STATEMENTS } from "@/lib/intake/peptides-glp-options";

const yesNo = z.enum(["yes", "no"]);
const optionalText = z.string().trim().optional().default("");

const previousTherapyEntrySchema = z.object({
  therapy: z.string().min(1),
  dose: optionalText,
  duration: optionalText,
  reasonStopped: optionalText,
  sideEffects: optionalText,
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
    primaryCarePhysician: optionalText,
    referringPhysician: optionalText,
    firstAppointmentDate: optionalText,
  }),
  programs: z.array(z.string()).min(1, "Select at least one program of interest."),
  goals: z.object({
    primaryGoals: z.array(z.string()).min(1, "Select at least one treatment goal."),
    otherGoal: optionalText,
    desiredGoalWeight: optionalText,
    aestheticOutcomes: optionalText,
  }),
  weightHistory: z.object({
    currentWeight: optionalText,
    highestAdultWeight: optionalText,
    lowestAdultWeight: optionalText,
    struggleDuration: z.string().optional().default(""),
    previousApproaches: z.array(z.string()).default([]),
    previousTherapies: z.array(previousTherapyEntrySchema).default([]),
    previousTherapyExperience: optionalText,
  }),
  medicalHistory: z.object({
    conditions: z.array(z.string()).default([]),
    hormonalDisorderDetail: optionalText,
    otherConditions: yesNo,
    otherConditionsDetail: optionalText,
    recentSurgery: yesNo,
    recentSurgeryDetail: optionalText,
    pregnantBreastfeedingPlanning: yesNo,
  }),
  contraindications: z.object({
    items: z.array(z.string()).default([]),
    medicationAllergy: yesNo,
    medicationAllergyDetail: optionalText,
  }),
  familyHistory: z.array(z.string()).default([]),
  medications: z.object({
    prescriptions: optionalText,
    supplements: optionalText,
    peptidesInUse: optionalText,
    hormones: optionalText,
    medicationAllergies: optionalText,
    foodAllergies: optionalText,
    otherAllergies: optionalText,
  }),
  lifestyle: z.object({
    activityFrequency: z.string().optional().default(""),
    averageDailySteps: optionalText,
    averageSleepHours: optionalText,
    dietType: z.string().optional().default(""),
    otherDiet: optionalText,
    skincareRoutine: yesNo.optional(),
    skincareRoutineDetail: optionalText,
    alcoholOrSubstances: yesNo.optional(),
    alcoholOrSubstancesDetail: optionalText,
    smokingStatus: z.array(z.string()).default([]),
    stressLevel: z.string().optional().default(""),
  }),
  nutrition: z.object({
    mealsPerDay: optionalText,
    waterIntakeOz: optionalText,
    proteinIntakeG: optionalText,
    eatingPatterns: z.array(z.string()).default([]),
  }),
  womensHealth: z.object({
    lastMenstrualPeriod: optionalText,
    birthControlMethod: optionalText,
    selections: z.array(z.string()).default([]),
  }),
  labs: z.object({
    recentLabs: z.array(z.string()).default([]),
  }),
  symptoms: z.array(z.string()).default([]),
  acknowledgments: z.object({
    initials: z
      .record(z.string())
      .refine(
        (value) => ACKNOWLEDGMENT_STATEMENTS.every((_, index) => Boolean(value[String(index)]?.trim())),
        "Initial each acknowledgment statement.",
      ),
  }),
  consent: z.object({
    informedSafetyDiscussed: z.literal(true, {
      errorMap: () => ({ message: "Confirm that safety information has been reviewed." }),
    }),
    telemedicineAttestation: z.literal(true, {
      errorMap: () => ({ message: "Telemedicine attestation is required when applicable." }),
    }),
    informedConsent: z.literal(true, {
      errorMap: () => ({ message: "Informed consent is required." }),
    }),
    hipaaPrivacyAcknowledged: z.literal(true, {
      errorMap: () => ({ message: "HIPAA privacy acknowledgment is required." }),
    }),
    referralSource: z.string().min(1, "Please tell us how you heard about KIAN Privé."),
    referralOther: optionalText,
    clientSignature: z.string().trim().min(2, "Client signature is required."),
    signatureDate: z.string().min(1, "Signature date is required."),
    printedName: z.string().trim().min(2, "Printed name is required."),
  }),
});

export type PeptidesGlpIntakeFormData = z.infer<typeof peptidesGlpIntakeSchema>;

export const peptidesGlpStepValidators = [
  peptidesGlpIntakeSchema.pick({ patient: true, programs: true }),
  peptidesGlpIntakeSchema.pick({ goals: true }),
  peptidesGlpIntakeSchema.pick({ weightHistory: true }),
  peptidesGlpIntakeSchema.pick({ medicalHistory: true, contraindications: true }),
  peptidesGlpIntakeSchema.pick({ familyHistory: true, medications: true }),
  peptidesGlpIntakeSchema.pick({ lifestyle: true, nutrition: true, womensHealth: true }),
  peptidesGlpIntakeSchema.pick({ labs: true, symptoms: true }),
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
    skincareRoutine: undefined,
    skincareRoutineDetail: "",
    alcoholOrSubstances: undefined,
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
    informedSafetyDiscussed: true,
    telemedicineAttestation: true,
    informedConsent: true,
    hipaaPrivacyAcknowledged: true,
    referralSource: "",
    referralOther: "",
    clientSignature: "",
    signatureDate: "",
    printedName: "",
  },
};
