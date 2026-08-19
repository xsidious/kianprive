import { InvoicePayExperience } from "@/components/commerce/InvoicePayExperience";

/** Static design preview — no database required. */
export default function PayDesignPreviewPage() {
  return (
    <InvoicePayExperience
      token="preview-token"
      orderNumber="KP-THERAPY-1787176018543"
      total={523}
      patientName="Yolanda Perez"
      notes="Please provide your shipping address. SC GPL3- 5 clicks weekly (1mg) for 2 weeks then if tolerated 10 clicks (2mg) weekly for 4 weeks."
      items={[
        { id: "1", title: "GLP-3R Pen 24mg", quantity: 1, lineTotal: 199 },
        { id: "2", title: "MOTS-C 10mg 3mL Pen", quantity: 1, lineTotal: 199 },
        { id: "3", title: "Semax+Selank - 1mg/1mg per mL (5mL vial)", quantity: 1, lineTotal: 125 },
      ]}
      paid={false}
      expired={false}
    />
  );
}
