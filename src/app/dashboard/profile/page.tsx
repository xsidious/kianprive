"use client";

import Link from "next/link";
import { CircleUserRound, MessageCircleMore, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { MemberProfileFields } from "@/components/account/MemberProfileFields";
import { emptyMemberProfile, memberProfileFromRecord, type MemberProfileDraft } from "@/lib/account/member-profile";
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
  const [profile, setProfile] = useState<MemberProfileDraft>(emptyMemberProfile());
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as { profile: MemberProfileDraft & { email?: string } };
      setProfile(memberProfileFromRecord(payload.profile));
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
      body: JSON.stringify(profile),
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
          <MemberProfileFields value={profile} onChange={setProfile} />
          <button disabled={loading} className={`${editorialCtaPrimary} disabled:cursor-not-allowed disabled:opacity-70`}>
            SAVE PROFILE
          </button>
          {saved ? <p className="text-sm text-[#8f6f3e]">Saved.</p> : null}
        </form>

        <form
          className={`mt-8 space-y-4 ${editorialPanel} p-5`}
          onSubmit={async (e) => {
            e.preventDefault();
            setPasswordMessage("");
            if (newPassword !== confirmPassword) {
              setPasswordMessage("New passwords do not match.");
              return;
            }
            const res = await fetch("/api/account/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currentPassword, newPassword }),
            });
            const payload = (await res.json()) as { error?: string };
            if (!res.ok) {
              setPasswordMessage(payload.error || "Could not change password.");
              return;
            }
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Password updated.");
          }}
        >
          <h2 className="font-serif text-2xl text-[#1f1a15]">Change password</h2>
          <input
            className={editorialInput}
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <input
            className={editorialInput}
            type="password"
            minLength={8}
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            className={editorialInput}
            type="password"
            minLength={8}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className={editorialCtaPrimary}>UPDATE PASSWORD</button>
          {passwordMessage ? <p className="text-sm text-[#8f6f3e]">{passwordMessage}</p> : null}
        </form>
      </EditorialSection>
    </div>
  );
}
