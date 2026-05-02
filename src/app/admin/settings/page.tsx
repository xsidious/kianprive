import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl text-[#1f1a15]">Settings</h1>
      <p className="mt-2 text-[#6f6251]">Global site configuration, SEO defaults, branding tokens, and integration settings.</p>
      <div className="mt-6 grid gap-3">
        {settings.length === 0 ? (
          <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 text-[#6f6251]">No settings saved yet.</article>
        ) : (
          settings.map((setting) => (
            <article key={setting.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
              <p className="text-sm text-[#8f6f3e]">{setting.key}</p>
              <pre className="mt-2 overflow-x-auto text-xs text-[#4f4335]">{JSON.stringify(setting.value, null, 2)}</pre>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
