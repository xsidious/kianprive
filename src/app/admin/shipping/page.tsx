import { AdminShippingSettings } from "@/components/admin/AdminShippingSettings";
import { adminEyebrow, adminMuted, adminTitle } from "@/components/admin/ui";

export default function AdminShippingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className={adminEyebrow}>Commerce</p>
        <h1 className={adminTitle}>Shipping</h1>
        <p className={adminMuted}>
          Set the default patient shipping rate, free-shipping threshold, and whether shipping is always free. This is
          used at checkout, on invoices, and as the default shipping amount when pricing therapy.
        </p>
      </div>
      <AdminShippingSettings />
    </div>
  );
}
