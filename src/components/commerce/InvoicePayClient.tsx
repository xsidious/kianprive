"use client";

import { TherapyAcceptPay } from "@/components/intake/TherapyAcceptPay";

type Props = {
  token: string;
  total: number;
  orderNumber: string;
  patientName?: string | null;
};

export function InvoicePayClient({ token, total, orderNumber, patientName }: Props) {
  return (
    <TherapyAcceptPay
      orderId={token}
      total={total}
      orderNumber={orderNumber}
      endpoint={`/api/pay/${token}`}
      buttonLabel="Pay invoice"
      patientName={patientName}
    />
  );
}
