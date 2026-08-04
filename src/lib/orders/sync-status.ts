import { FulfillmentStatus, OrderStatus } from "@prisma/client";

/** Keep Order.status aligned with fulfillment so members don't see stale "PROCESSING". */
export function orderStatusFromFulfillment(
  fulfillment: FulfillmentStatus | string,
  currentStatus?: OrderStatus | string | null,
): OrderStatus {
  const f = String(fulfillment);
  if (f === "DELIVERED") return OrderStatus.DELIVERED;
  if (f === "FULFILLED" || f === "PARTIALLY_FULFILLED") return OrderStatus.FULFILLED;
  if (f === "PROCESSING" || f === "UNFULFILLED") {
    if (currentStatus === "PENDING" || currentStatus === "CANCELED" || currentStatus === "REFUNDED") {
      return (currentStatus as OrderStatus) || OrderStatus.PROCESSING;
    }
    return OrderStatus.PROCESSING;
  }
  return OrderStatus.PROCESSING;
}
