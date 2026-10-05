import { z } from "zod";
import {
  ICOONE_ALCOHOL,
  ICOONE_DELIVERY,
  ICOONE_FOCUS_AREAS,
  ICOONE_HEARD_ABOUT,
  ICOONE_HISTORY,
  ICOONE_HISTORY_WHO,
  ICOONE_PROTOCOLS,
  ICOONE_SURGERY_SITES,
  ICOONE_SYMPTOMS,
  ICOONE_WOMEN,
} from "@/lib/intake/icoone-options";

const yesNo = z.enum(["yes", "no"], { message: "Choose yes or no." });

export const icooneIntakeSchema = z
  .object({
    source: z.literal("icoone"),
    patient: z.object({
      fullName: z.string().trim().min(2, "Name is required."),
      email: z.string().trim().email("A valid email is required."),
      phone: z.string().trim().min(7, "Phone is required."),
      dateOfBirth: z.string().min(1, "Date of birth is required."),
      age: z.string().trim().min(1, "Age is required."),
      occupation: z.string().trim().min(1, "Occupation is required."),
    }),
    recentIllness: yesNo,
    heardAbout: z.enum(ICOONE_HEARD_ABOUT, { message: "Choose how you heard about us." }),
    referralName: z.string().trim().default(""),
    cosmeticSurgery: yesNo,
    surgerySite: z.enum(ICOONE_SURGERY_SITES).optional(),
    surgeryWhen: z.string().trim().default(""),
    surgeonNamePhone: z.string().trim().default(""),
    surgeryNotes: z.string().trim().default(""),
    physicianCleared: yesNo,
    focusAreas: z.array(z.enum(ICOONE_FOCUS_AREAS)).min(1, "Choose at least one area of focus."),
    underDoctorCare: z.string().trim().default(""),
    drugAllergies: z.string().trim().default(""),
    medicalHistory: z.object({
      conditions: z.array(z.enum(ICOONE_HISTORY)).min(1, "Select your medical history, or None."),
      who: z.array(z.enum(ICOONE_HISTORY_WHO)).default([]),
    }),
    symptoms: z.array(z.enum(ICOONE_SYMPTOMS)).min(1, "Select current symptoms, or None of the above."),
    medications: z.string().trim().min(1, "List prescription drugs or supplements, or write none."),
    peptides: z.string().trim().min(1, "Answer the peptide question, or write none."),
    womenOnly: z.array(z.enum(ICOONE_WOMEN)).default([]),
    children: z.union([yesNo, z.literal("")]).default(""),
    childrenCount: z.string().trim().default(""),
    youngestChildAge: z.string().trim().default(""),
    delivery: z.enum(ICOONE_DELIVERY).optional(),
    menopause: z.union([yesNo, z.literal("")]).default(""),
    menopauseAge: z.string().trim().default(""),
    illegalDrugUse: yesNo,
    alcohol: z.array(z.enum(ICOONE_ALCOHOL)).min(1, "Select your alcohol use."),
    disclaimerAccepted: z.literal("yes", { message: "Accept the disclaimer to continue." }),
    typedSignature: z.string().trim().min(2, "Type your signature to accept."),
    clinician: z.object({
      height: z.string().trim().default(""),
      weight: z.string().trim().default(""),
      protocols: z.array(z.enum(ICOONE_PROTOCOLS)).default([]),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.cosmeticSurgery === "yes" && !value.surgerySite) {
      ctx.addIssue({ code: "custom", path: ["surgerySite"], message: "Choose the surgery site." });
    }
    const history = value.medicalHistory.conditions.filter((item) => item !== "None");
    if (history.length && value.medicalHistory.who.length === 0) {
      ctx.addIssue({ code: "custom", path: ["medicalHistory", "who"], message: "Choose who had the condition." });
    }
    if (value.children === "yes" && !value.childrenCount.trim()) {
      ctx.addIssue({ code: "custom", path: ["childrenCount"], message: "How many children?" });
    }
    if (value.menopause === "yes" && !value.menopauseAge.trim()) {
      ctx.addIssue({ code: "custom", path: ["menopauseAge"], message: "At what age?" });
    }
  });

export type IcooneIntake = z.infer<typeof icooneIntakeSchema>;

export const defaultIcooneIntake = {
  source: "icoone" as const,
  patient: {
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    age: "",
    occupation: "",
  },
  recentIllness: "" as "yes" | "no" | "",
  heardAbout: "" as (typeof ICOONE_HEARD_ABOUT)[number] | "",
  referralName: "",
  cosmeticSurgery: "" as "yes" | "no" | "",
  surgerySite: "" as (typeof ICOONE_SURGERY_SITES)[number] | "",
  surgeryWhen: "",
  surgeonNamePhone: "",
  surgeryNotes: "",
  physicianCleared: "" as "yes" | "no" | "",
  focusAreas: [] as Array<(typeof ICOONE_FOCUS_AREAS)[number]>,
  underDoctorCare: "",
  drugAllergies: "",
  medicalHistory: {
    conditions: [] as Array<(typeof ICOONE_HISTORY)[number]>,
    who: [] as Array<(typeof ICOONE_HISTORY_WHO)[number]>,
  },
  symptoms: [] as Array<(typeof ICOONE_SYMPTOMS)[number]>,
  medications: "",
  peptides: "",
  womenOnly: [] as Array<(typeof ICOONE_WOMEN)[number]>,
  children: "" as "yes" | "no" | "",
  childrenCount: "",
  youngestChildAge: "",
  delivery: "" as (typeof ICOONE_DELIVERY)[number] | "",
  menopause: "" as "yes" | "no" | "",
  menopauseAge: "",
  illegalDrugUse: "" as "yes" | "no" | "",
  alcohol: [] as Array<(typeof ICOONE_ALCOHOL)[number]>,
  disclaimerAccepted: "" as "yes" | "no" | "",
  typedSignature: "",
  clinician: {
    height: "",
    weight: "",
    protocols: [] as Array<(typeof ICOONE_PROTOCOLS)[number]>,
  },
};
