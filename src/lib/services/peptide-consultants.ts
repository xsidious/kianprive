export const PEPTIDE_CONSULTANTS_HASH = "consultants";
export const PEPTIDE_CONSULTANTS_HREF = `/services/glp1-peptides#${PEPTIDE_CONSULTANTS_HASH}`;

export type PeptideConsultant = {
  id: string;
  name: string;
  title: string;
  paragraphs: string[];
};

export const peptideConsultants: PeptideConsultant[] = [
  {
    id: "jennifer-fenner",
    name: "Jennifer Fenner",
    title: "Certified Peptide Consultant",
    paragraphs: [
      "Jennifer Fenner is a Certified Peptide Consultant with KIAN Privé and a graduate of Dr. William Seeds' peptide education program. She helps clients connect physician-prescribed peptide therapy with education, lifestyle, and a whole-person approach to wellness.",
      "With a background in peptide education, fitness, nutrition, and recovery practices, Jennifer supports goals around metabolic health, healthy aging, body composition, cognitive performance, and sustainable habits alongside your clinical plan.",
    ],
  },
  {
    id: "shane-shuckerow",
    name: "Shane Shuckerow",
    title: "Health, Wellness & Fitness Expert",
    paragraphs: [
      "Shane Shuckerow is a fitness and wellness professional with a foundation in exercise physiology and personal training. He brings coaching experience in human performance, metabolic health, and individualized program design.",
      "Certified through ISSA as a Personal Trainer, Nutrition Specialist, and Weight Management Specialist, Shane helps clients integrate movement, nutrition, and behavioral coaching with physician-prescribed peptide protocols.",
    ],
  },
];
