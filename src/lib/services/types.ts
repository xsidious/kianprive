export type ServiceContentSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ServiceMediaItem = {
  src: string;
  alt: string;
  caption?: string;
};

export type ServiceDetail = {
  slug: string;
  title: string;
  image: string;
  partnerLogo?: string;
  partnerName?: string;
  externalBookingUrl?: string;
  isPartnerService?: boolean;
  /** Optional hero/flyer for detail page and modal (falls back to image). */
  promoImage?: string;
  gallery?: ServiceMediaItem[];
  description: string;
  requiresLogin?: boolean;
  details?: string[];
  includes?: string[];
  pricing?: string[];
  membershipNotes?: string[];
  availability?: string[];
  showPeptidesExperience?: boolean;
  video?: string;
  contentSections?: ServiceContentSection[];
};

export type ServiceListingItem = ServiceDetail | Omit<ServiceDetail, "slug"> & { slug?: string };

export type ServiceHighlight = {
  title: string;
  description: string;
  image: string;
  href: string;
};

export type BookingServiceOption = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  guestPrice: number;
  memberPrice: number;
  durationMinutes: number;
};
