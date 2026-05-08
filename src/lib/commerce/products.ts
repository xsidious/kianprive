export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

export const catalogProducts: CatalogProduct[] = [
  { id: "p1", name: "Lymphatic Support Serum", category: "Skincare", price: 129, image: "/images/facial-treatments.jpg" },
  { id: "p2", name: "Daily Recovery Electrolyte Blend", category: "Nutrition", price: 59, image: "/images/beauty.avif" },
  { id: "p3", name: "Collagen Renewal Capsules", category: "Supplements", price: 89, image: "/images/esthetics.avif" },
  { id: "p4", name: "Night Repair Facial Oil", category: "Skincare", price: 98, image: "/images/facial-treatments.jpg" },
  { id: "p5", name: "Metabolic Support Protein", category: "Nutrition", price: 72, image: "/images/nutrition.avif" },
  { id: "p6", name: "Advanced Beauty Essentials Kit", category: "Beauty", price: 149, image: "/images/wellness.avif" },
];
