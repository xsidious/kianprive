"use client";

import Link from "next/link";
import { CircleUserRound, MessageCircleMore, Phone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/contact";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function DashboardProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as {
        profile: { name: string; phone: string; company: string; email: string };
      };
      setName(payload.profile.name ?? "");
      setPhone(payload.profile.phone ?? "");
      setCompany(payload.profile.company ?? "");
      setEmail(payload.profile.email ?? "");
      setLoading(false);
    }
    void loadProfile();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, company }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className={`${editorialPanel} p-6`}>
          <EditorialEyebrow>
            <span className="inline-flex items-center gap-2">
              <CircleUserRound size={14} /> MEMBER PROFILE
            </span>
          </EditorialEyebrow>
          <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">Profile Settings</h1>
          <p className="mt-2 text-[#6f6251]">Update your details for concierge communication and service planning.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={buildWhatsAppUrl(`Hi KIAN Privé team, I need profile/account help for ${email || "my account"}.`)}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`}
            >
              <MessageCircleMore size={15} />
              WHATSAPP CONCIERGE
            </a>
            <Link href="/dashboard/services" className={`inline-flex items-center gap-2 ${editorialCtaSecondary}`}>
              <Sparkles size={15} />
              VIEW MY SERVICES
            </Link>
          </div>
        </div>

        <form onSubmit={onSubmit} className={`mt-8 space-y-4 ${editorialPanel} p-5`}>
          <div className={`${editorialPanel} p-3 text-[#6f6251]`}>
            <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">EMAIL</p>
            <p>{email || "Loading..."}</p>
          </div>
          <input className={editorialInput} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="relative">
            <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8f6f3e]" />
            <input
              className={`${editorialInput} pl-9`}
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <input
            className={editorialInput}
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <button disabled={loading} className={`${editorialCtaPrimary} disabled:cursor-not-allowed disabled:opacity-70`}>
            SAVE PROFILE
          </button>
          {saved ? <p className="text-sm text-[#8f6f3e]">Saved.</p> : null}
        </form>
      </EditorialSection>
    </div>
  );
}
