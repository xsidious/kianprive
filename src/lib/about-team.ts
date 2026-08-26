export type AboutTeamMember = {
  name: string;
  title: string;
  subtitle: string;
  image?: string;
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
    title: "Physician",
    subtitle: "Clinical Care",
    image: "/images/CarmenRamirez.png",
  },
  {
    name: "Chyle Beaird, M.D.",
    title: "Medical Director",
    subtitle: "Physician",
    image: "/images/ChyleBeaird.png",
  },
  {
    name: "Dr. John Maarouf, DO",
    title: "Concierge and Telemedicine",
    subtitle: "Family & Sports Medicine",
    image: "/images/JohnMaarouf.jpeg",
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
    name: "Dr. Karl Ryan, DDS",
    title: "Aesthetic Injector",
    subtitle: "Provider",
    image: "/images/KarlRyan.png",
  },
  {
    name: "Jacqueline Hayes",
    title: "Pharmacy Technician",
    subtitle: "Clinical Support",
    image: "/images/JacquelineHayes.png",
  },
  {
    name: "Violetta",
    title: "Sales Ambassador",
    subtitle: "Member Concierge",
  },
];
