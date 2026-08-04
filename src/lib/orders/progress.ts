import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "@prisma/client";

export type PatientOrderProgress = {
  label: string;
  detail: string;
  step: number; // 1..4
  tone: "pending" | "paid" | "shipped" | "done" | "issue";
};

/** Patient-facing progress — prefer fulfillment over raw order.status. */
export function patientOrderProgress(input: {
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  fulfillmentStatus: FulfillmentStatus | string;
}): PatientOrderProgress {
  const payment = String(input.paymentStatus);
  const fulfillment = String(input.fulfillmentStatus);
  const status = String(input.status);

  if (payment === "FAILED") {
    return {
      label: "Payment issue",
      detail: "Please contact concierge if you need help completing payment.",
      step: 1,
      tone: "issue",
    };
  }

  if (payment === "UNPAID" || status === "PENDING") {
    return {
      label: "Awaiting payment",
      detail: "Your order is reserved until payment is completed.",
      step: 1,
      tone: "pending",
    };
  }

  if (fulfillment === "DELIVERED" || status === "DELIVERED") {
    return {
      label: "Delivered",
      detail: "Your order has been delivered.",
      step: 4,
      tone: "done",
    };
  }

  if (fulfillment === "FULFILLED" || status === "FULFILLED") {
    return {
      label: "Fulfilled",
      detail: "Your order has been fulfilled and shipped.",
      step: 3,
      tone: "shipped",
    };
  }

  if (fulfillment === "PARTIALLY_FULFILLED") {
    return {
      label: "Partially shipped",
      detail: "Part of your order is on the way.",
      step: 3,
      tone: "shipped",
    };
  }

  if (status === "CANCELED" || status === "REFUNDED" || payment === "REFUNDED") {
    return {
      label: status === "CANCELED" ? "Canceled" : "Refunded",
      detail: "Contact concierge if you have questions about this order.",
      step: 1,
      tone: "issue",
    };
  }

  if (
    fulfillment === "PROCESSING" ||
    fulfillment === "UNFULFILLED" ||
    status === "PROCESSING" ||
    status === "PAID" ||
    payment === "PAID" ||
    payment === "PARTIALLY_REFUNDED"
  ) {
    return {
      label: "Preparing to ship",
      detail: "Payment received. Our team is preparing your order.",
      step: 2,
      tone: "paid",
    };
  }

  return {
    label: status.replaceAll("_", " "),
    detail: "We're updating your order status.",
    step: 1,
    tone: "pending",
  };
}
