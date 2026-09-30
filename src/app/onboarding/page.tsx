"use client";

import { useEffect, useState } from "react";
import { MemberProfileFields } from "@/components/account/MemberProfileFields";
import { emptyMemberProfile, memberProfileFromRecord, type MemberProfileDraft } from "@/lib/account/member-profile";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

export default function OnboardingPage() {
  const [profile, setProfile] = useState<MemberProfileDraft>(emptyMemberProfile());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as { profile: MemberProfileDraft };
      setProfile(memberProfileFromRecord(payload.profile));
      setLoading(false);
    }
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (profile.name.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, completeOnboarding: true }),
    });
    if (!res.ok) {
      setError("Could not save your profile.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className={`${editorialPanel} p-6 sm:p-8`}>
          <EditorialEyebrow>WELCOME</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">Finish your member profile</h1>
          <p className="mt-3 max-w-2xl text-[#6f6251]">
            Confirm your details and add any medical conditions, allergies, or medications so your care team has them on
            file.
          </p>
        </div>
        <form className={`mt-8 space-y-4 ${editorialPanel} p-6`} onSubmit={(e) => void onSubmit(e)}>
          <MemberProfileFields value={profile} onChange={setProfile} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className={`w-full ${editorialCtaPrimary}`}>
            {loading ? "LOADING…" : "SAVE AND CONTINUE"}
          </button>
        </form>
      </EditorialSection>
    </div>
  );
}
