"use client";

import { useState } from "react";

export default function DashboardProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, company }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-4xl">Profile Settings</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#171310] p-3" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <button className="rounded-full bg-[#d7b676] px-5 py-2 text-black">Save Profile</button>
        {saved && <p className="text-sm text-[#d7b676]">Saved.</p>}
      </form>
    </div>
  );
}
