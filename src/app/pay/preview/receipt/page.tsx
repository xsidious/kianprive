import { PaymentReceipt } from "@/components/commerce/PaymentReceipt";

/** Static receipt preview — no database required. */
export default function PayReceiptPreviewPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-14">
      <PaymentReceipt
        receipt={{
          orderNumber: "KP-THERAPY-1787176018543",
          amount: 523,
          transId: "80047291863",
          paidAt: new Date().toISOString(),
          cardLast4: "4242",
          cardBrand: "Visa",
          patientName: "Yolanda Perez",
        }}
      />
    </main>
  );
}
