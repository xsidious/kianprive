import { addOnLabPanels, coreLabPanels } from "@/lib/services/pricing-menus";

export const LAB_BOOKING_SERVICE_IDS = new Set([
  "comprehensive-bloodwork",
  ...coreLabPanels.map((panel) => panel.slug),
  ...addOnLabPanels.map((panel) => panel.slug),
]);

export function isLabBookingServiceId(serviceId: string) {
  return LAB_BOOKING_SERVICE_IDS.has(serviceId);
}

export function bookingIncludesLabWork(serviceIds: string[]) {
  return serviceIds.some(isLabBookingServiceId);
}

export function labPanelsForBooking(serviceIds: string[]) {
  const allPanels = [...coreLabPanels, ...addOnLabPanels];
  const matched = serviceIds.flatMap((id) => {
    const panel = allPanels.find((item) => item.slug === id);
    return panel ? [panel] : [];
  });

  if (matched.length) return matched;

  if (serviceIds.includes("comprehensive-bloodwork")) {
    const essential = coreLabPanels.find((panel) => panel.slug === "lab-panel-essential");
    return essential ? [essential] : [];
  }

  return [];
}
