import type { BookingServiceOption } from "@/lib/services/types";
import { getServiceBySlug } from "@/lib/services/catalog";
import { addOnLabPanels, coreLabPanels, memberFromGuest } from "@/lib/services/pricing-menus";

function bookingOption(
  slug: string,
  guestPrice: number,
  memberPrice: number,
  durationMinutes: number,
  overrides?: Partial<Pick<BookingServiceOption, "title" | "description" | "image">>,
): BookingServiceOption {
  const service = getServiceBySlug(slug);
  if (!service) throw new Error(`Missing booking service: ${slug}`);
  return {
    id: slug,
    slug,
    title: overrides?.title ?? service.title,
    description: overrides?.description ?? service.description,
    image: overrides?.image ?? service.image,
    guestPrice,
    memberPrice,
    durationMinutes,
  };
}

function labBooking(slug: string, durationMinutes = 30) {
  const panel = [...coreLabPanels, ...addOnLabPanels].find((item) => item.slug === slug);
  if (!panel) throw new Error(`Missing lab panel booking: ${slug}`);
  return bookingOption(slug, panel.guest, panel.member, durationMinutes);
}

/** Canonical bookable services — IDs match catalog slugs. */
export const bookingServiceOptions: BookingServiceOption[] = [
  bookingOption("telemedicine", 300, memberFromGuest(300), 45),
  bookingOption("physician-visit", 350, memberFromGuest(350), 45),
  bookingOption("icoone-laser", 195, memberFromGuest(195), 50),
  bookingOption("facial-aesthetics", 310, 248, 60),
  bookingOption("nutrition", 150, memberFromGuest(150), 45),
  bookingOption("iv-therapy", 230, 184, 60),
  bookingOption("comprehensive-bloodwork", 224, 179, 30),
  ...coreLabPanels.map((panel) => labBooking(panel.slug, panel.slug === "lab-panel-executive" ? 45 : 30)),
  ...addOnLabPanels.map((panel) => labBooking(panel.slug)),
  bookingOption("personal-training", 125, memberFromGuest(125), 60),
  bookingOption("beauty-hair-nails", 120, 96, 60),
  bookingOption("inbody-scan", 30, 0, 20),
  bookingOption("microneedling-with-exosomes", 600, 480, 60),
  bookingOption("korean-organic-skincare", 195, 156, 60),
  bookingOption("glp1-peptides", 100, 80, 45),
];

export function getBookingOptionById(id: string) {
  return bookingServiceOptions.find((option) => option.id === id) ?? null;
}

export function getBookingOptionIds() {
  return bookingServiceOptions.map((option) => option.id);
}
