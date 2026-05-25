import type { BookingServiceOption } from "@/lib/services/types";
import { getServiceBySlug } from "@/lib/services/catalog";

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

/** Canonical bookable services — IDs match catalog slugs. */
export const bookingServiceOptions: BookingServiceOption[] = [
  bookingOption("telemedicine", 245, 195, 45),
  bookingOption("icoone-laser", 220, 176, 50),
  bookingOption("facial-aesthetics", 310, 248, 60),
  bookingOption("nutrition", 185, 148, 45),
  bookingOption("iv-therapy", 165, 132, 60),
  bookingOption("comprehensive-bloodwork", 210, 168, 30),
  bookingOption("beauty-hair-nails", 120, 96, 60),
  bookingOption("inbody-scan", 30, 0, 20),
  bookingOption("power-plate", 25, 0, 20),
  bookingOption("microneedling-with-exosomes", 600, 480, 60),
  bookingOption("korean-organic-skincare", 195, 156, 60),
  bookingOption("glp1-peptides", 0, 0, 45),
  bookingOption("mindtap", 125, 100, 60),
];

export function getBookingOptionById(id: string) {
  return bookingServiceOptions.find((option) => option.id === id) ?? null;
}

export function getBookingOptionIds() {
  return bookingServiceOptions.map((option) => option.id);
}
