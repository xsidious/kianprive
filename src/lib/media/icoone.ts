export type IcooneMediaItem = {
  src: string;
  alt: string;
  caption: string;
};

/** Primary hero image for Icoone® Lymphatic Drainage across the site. */
export const icoonePrimaryImage = "/images/icoone-treatment-session.png";

/** Reusable Icoone imagery — import anywhere treatments or training are shown. */
export const icooneMediaGallery: IcooneMediaItem[] = [
  {
    src: "/images/icoone-treatment-session.png",
    alt: "Icoone® lymphatic drainage session with Robotwins handpieces",
    caption: "Full-body lymphatic session",
  },
  {
    src: "/images/icoonelyphaticdrainage.jpeg",
    alt: "Icoone® lymphatic drainage treatment in session",
    caption: "Lymphatic drainage protocol",
  },
  {
    src: "/images/icoone-consultation.png",
    alt: "Icoone® consultation with client in compression body suit",
    caption: "Personal consultation",
  },
  {
    src: "/images/icoone-treatment-detail.png",
    alt: "Close-up of Icoone® microstimulation on décolleté",
    caption: "Precision décolleté protocol",
  },
  {
    src: "/images/icoone-treatment-face.png",
    alt: "Icoone® facial and neck lymphatic treatment",
    caption: "Face and neck targeting",
  },
  {
    src: "/images/icoone1jpeg.jpeg",
    alt: "Icoone® treatment environment at KIAN Privé",
    caption: "Clinical treatment setting",
  },
  {
    src: "/images/icoone2.jpeg",
    alt: "Icoone® device and practitioner care",
    caption: "Roboderm microstimulation",
  },
  {
    src: "/images/icoone3.jpeg",
    alt: "Icoone® wellness session detail",
    caption: "Recovery-focused care",
  },
];

export function getIcooneImage(index: number) {
  return icooneMediaGallery[index % icooneMediaGallery.length];
}
