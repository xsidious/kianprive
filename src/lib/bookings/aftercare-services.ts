/** Bookings that include Icoone® / lymphatic aftercare guidance for the patient. */
const AFTERCARE_BOOKING_SERVICE_IDS = new Set(["icoone-laser"]);

export function bookingIncludesAftercare(serviceIds: string[]) {
  return serviceIds.some((id) => AFTERCARE_BOOKING_SERVICE_IDS.has(id));
}
