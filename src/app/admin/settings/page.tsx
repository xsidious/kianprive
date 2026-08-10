import { AdminSettingsEditor } from "@/app/admin/settings/admin-settings-editor";
import { AdminShippingSettings } from "@/components/admin/AdminShippingSettings";

export default async function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl text-[#1f1a15]">Settings</h1>
      <p className="mt-2 text-[#6f6251]">
        Shipping, global site configuration, SEO defaults, branding tokens, and integration settings.
      </p>
      <div className="mt-6">
        <AdminShippingSettings />
      </div>
      <div className="mt-8">
        <h2 className="font-serif text-xl text-[#1f1a15]">Advanced settings</h2>
        <p className="mt-1 text-sm text-[#6f6251]">Raw JSON site settings (advanced).</p>
        <AdminSettingsEditor />
      </div>
    </div>
  );
}
