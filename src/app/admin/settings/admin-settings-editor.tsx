"use client";

import { useEffect, useMemo, useState } from "react";

type SiteSetting = {
  id: string;
  key: string;
  value: unknown;
};

export function AdminSettingsEditor() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/settings");
      if (!response.ok) return;
      const payload = (await response.json()) as { settings: SiteSetting[] };
      setSettings(payload.settings);
    }
    void load();
  }, []);

  const rows = useMemo(
    () =>
      settings.map((setting) => ({
        ...setting,
        text: JSON.stringify(setting.value, null, 2),
      })),
    [settings],
  );

  function updateText(key: string, text: string) {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.key === key
          ? {
              ...setting,
              value: text,
            }
          : setting,
      ),
    );
  }

  async function save() {
    setStatus("");
    try {
      const normalized = settings.map((setting) => {
        if (typeof setting.value !== "string") {
          return { key: setting.key, value: setting.value };
        }
        return { key: setting.key, value: JSON.parse(setting.value) };
      });
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: normalized }),
      });
      if (!response.ok) throw new Error("failed");
      setStatus("Settings saved.");
    } catch {
      setStatus("Save failed. Ensure each value is valid JSON.");
    }
  }

  return (
    <div className="mt-6 grid gap-3">
      {rows.length === 0 ? (
        <article className="rounded-2xl border border-[#b78d4b2d] bg-white p-4 text-[#6f6251]">No settings saved yet.</article>
      ) : (
        rows.map((setting) => (
          <article key={setting.id} className="rounded-2xl border border-[#b78d4b2d] bg-white p-4">
            <p className="text-sm text-[#8f6f3e]">{setting.key}</p>
            <textarea
              value={typeof settings.find((s) => s.key === setting.key)?.value === "string" ? (settings.find((s) => s.key === setting.key)?.value as string) : setting.text}
              onChange={(event) => updateText(setting.key, event.target.value)}
              className="mt-2 min-h-[140px] w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3 font-mono text-xs text-[#4f4335]"
            />
          </article>
        ))
      )}
      <div className="flex items-center gap-3">
        <button onClick={save} className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
          Save All Settings
        </button>
        {status ? <p className="text-sm text-[#8f6f3e]">{status}</p> : null}
      </div>
    </div>
  );
}
