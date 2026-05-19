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
];

export function getBookingOptionById(id: string) {
  return bookingServiceOptions.find((option) => option.id === id) ?? null;
}

export function getBookingOptionIds() {
  return bookingServiceOptions.map((option) => option.id);
}
