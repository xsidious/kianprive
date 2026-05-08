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
      <h1 className="text-4xl text-[#1f1a15]">Profile Settings</h1>
      <p className="mt-2 text-[#6f6251]">Update your details for concierge communication and service planning.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-[#b78d4b2d] bg-white p-5">
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#fffaf2] p-3 text-[#1f1a15]" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#fffaf2] p-3 text-[#1f1a15]" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full rounded-xl border border-[#d7b6764d] bg-[#fffaf2] p-3 text-[#1f1a15]" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <button className="rounded-full bg-[#d7b676] px-5 py-2 text-[#1f1a15]">Save Profile</button>
        {saved && <p className="text-sm text-[#8f6f3e]">Saved.</p>}
      </form>
    </div>
  );
}
