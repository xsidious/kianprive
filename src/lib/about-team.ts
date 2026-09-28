export type AboutTeamMember = {
  name: string;
  title: string;
  subtitle: string;
  image?: string;
  /** Tailwind classes for portrait framing when the default crop does not fit. */
  imageClassName?: string;
  imageBackground?: string;
  bio?: string | string[];
};

export const aboutTeam: AboutTeamMember[] = [
  {
    name: "Alycia Lerer",
    title: "Founder",
    subtitle: "Wellness Coach",
    image: "/images/AlyciaLerer.png",
    bio: "For over 25 years Alycia lived under the bright lights of modeling, then as a senior entertainment executive. Keeping It All Natural is the KIAN philosophy—proactive self-care and harmony of body, mind, and spirit.",
  },
  {
    name: "Cherie Johnson",
    title: "Co-Founder",
    subtitle: "Certified Nutritionist · Wellness Educator",
    image: "/images/CherieJohnson.png",
    bio: "With over 30 years in nutrition, Cherie Johnson brings a refined, holistic approach to modern wellness. Organic living. Sustainable habits. Lifelong vitality. Private virtual consultations available.",
  },
  {
    name: "Dr. Carmen Ramirez",
    title: "Chief Medical Officer",
    subtitle: "Neurology · TBI & Stroke",
    image: "/images/CarmenRamirez.png",
    bio: [
      "Carmen Teresa Ramirez, M.D., M.Sc., M.B.A. is a board-certified neurologist and Chief Medical Officer, with more than two decades of clinical leadership across neurology, stroke care, and brain health. She earned her Bachelor of Science in Microbiology and Immunology from the University of Miami, her Master of Science in Pharmacology and Doctor of Medicine from the University of Ottawa, and an MBA from the University of Texas at Dallas.",
      "Dr. Ramirez has served as Stroke Program Director at multiple institutions across Florida and Texas, including South Florida Baptist Hospital, Brandon Regional Hospital, and Baylor Health Care System / Irving Medical Center. She has held faculty and academic appointments at Texas A&M University, where she served as Assistant Professor of Clinical Neurology and Director of Neurology and Stroke at College Station Medical Center.",
      "Her expertise spans neurohospitalist medicine, traumatic brain injury consultation, tele-neurology, and intraoperative neuromonitoring. She is board certified by the American Board of Psychiatry and Neurology, holds active medical licensure in more than a dozen states, and is a member of the American Academy of Neurology and the American Medical Association. She also serves on the board of Women in Distress of Broward County and as Vice Chair of Blanket Dreams.",
    ],
  },
  {
    name: "Chyle Beaird, M.D.",
    title: "Medical Director",
    subtitle: "Family Physician",
    image: "/images/ChyleBeaird.png",
    bio: [
      "Dr. Chyle E. Beaird, M.D. is a board-certified family physician and the Medical Director of KIAN Privé, bringing more than three decades of clinical experience to the physician-led luxury wellness concierge practice.",
      "A graduate of the University of California, Irvine College of Medicine, Dr. Beaird completed his surgical training at Howard University Hospital in Washington, D.C., and holds medical licensure in California and Florida. His career spans primary care, aesthetic medicine, dermatology, emergency medicine, and hospital-based care.",
      "He is a member of the American Academy of Family Physicians and the California Medical Association.",
    ],
  },
  {
    name: "Dr. John Maarouf, DO",
    title: "Concierge and Telemedicine",
    subtitle: "Family & Sports Medicine",
    image: "/images/JohnMaarouf.png",
    bio: "Dr. Maarouf is a dual board certified physician in Family and Sports Medicine who specializes in non surgical orthopedics and orthobiologics to remedy common injuries for every level of athlete like knee pain, meniscus injuries, rotator cuff tears, tennis/golfers elbow, plantar fasciitis and more. With a calm presence, sharp diagnostics, and an eye for detail, Dr. Maarouf guides personalized care that gets results.",
  },
  {
    name: "Dr. Lynn Lafferty",
    title: "Integrative Medicine & Clinical Nutrition",
    subtitle: "Pharm.D., N.D., MBA, DACBN, MH",
    image: "/images/LynnLafferty.png",
    bio: [
      "Lynn Lafferty, Pharm.D., N.D., MBA, DACBN, MH is a Doctor of Pharmacy and licensed pharmacist, naturopathic doctor, Master Herbalist, Diplomate in Clinical Nutrition, Licensed Nutritionist, and chef who is committed to finding the safest and most effective means to promote health and wellness over disease and illness.",
      "She is an Endowed Professor at Nova Southeastern University and Assistant Clinical Professor in the College of Pharmacy. She serves on the Board of the American Clinical Board of Nutrition and served five years on the Board of the Academy of Environmental Medicine. She uses mostly herbal remedies and diets to put the body back into balance.",
      "She offers online courses in herbal medicine and kitchen medicine for the public at drlynnlafferty.com, and courses for medical and other healthcare professionals at integrativehealtheducation.com, where she is bringing back Clinical Pearls.",
    ],
  },
  {
    name: "Dr. Karl Rayan, DDS",
    title: "Aesthetic Injector",
    subtitle: "Facial Aesthetics",
    image: "/images/KarlRyan.png",
    imageClassName: "object-contain object-center",
    imageBackground: "#8a7f74",
    bio: "Dr. Karl Rayan, DDS provides facial aesthetic treatments at KIAN Privé as part of the physician-led concierge team.",
  },
  {
    name: "Jacqueline Hayes",
    title: "Pharmacy Technician",
    subtitle: "Clinical Support",
    image: "/images/JacquelineHayes.png",
    bio: "Jacqueline Hayes supports the KIAN Privé clinical team as a pharmacy technician.",
  },
  {
    name: "Violetta Markelou",
    title: "Health & Life Coach",
    subtitle: "Certified Coach · Holistic Wellness",
    image: "/images/ViolettaMarkelou.png",
    bio: [
      "Violetta Markelou is a certified Health and Life Coach with a holistic approach rooted in food-as-medicine, hormone balance, longevity, and intentional lifestyle design.",
      "Her journey into health optimization began through the lymphatic system and a personal passion for understanding the body's natural ability to heal, detoxify, and restore balance. For over 15 years, Violetta has immersed herself in women's health, biohacking, hormone-supportive nutrition, nervous system regulation, and evidence-informed wellness strategies.",
      "Through personalized coaching, she helps clients take agency over their health, build sustainable habits, and support energy, digestion, mood, hormone balance, and overall vitality.",
    ],
  },
];
