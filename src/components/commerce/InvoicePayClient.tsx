"use client";

import { TherapyAcceptPay } from "@/components/intake/TherapyAcceptPay";

type Props = {
  token: string;
  total: number;
  orderNumber: string;
};

export function InvoicePayClient({ token, total, orderNumber }: Props) {
  return (
    <TherapyAcceptPay
      orderId={token}
      total={total}
      orderNumber={orderNumber}
      endpoint={`/api/pay/${token}`}
      buttonLabel="Pay invoice"
    />
  );
}
