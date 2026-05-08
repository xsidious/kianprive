import { AdminSettingsEditor } from "@/app/admin/settings/admin-settings-editor";

export default async function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl text-[#1f1a15]">Settings</h1>
      <p className="mt-2 text-[#6f6251]">Global site configuration, SEO defaults, branding tokens, and integration settings.</p>
      <AdminSettingsEditor />
    </div>
  );
}
