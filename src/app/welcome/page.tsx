"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  EditorialEyebrow,
  EditorialSection,
  editorialCtaPrimary,
  editorialCtaSecondary,
  editorialInput,
  editorialPanel,
} from "@/components/ui/editorial-primitives";

type Step = "identify" | "profile";

type Preview = {
  email: string;
  name: string;
  phone: string;
  dateOfBirth?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  importedNotes?: string;
};

function WelcomeForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [step, setStep] = useState<Step>(tokenFromUrl ? "profile" : "identify");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [importedNotes, setImportedNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [canEmailLink, setCanEmailLink] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) return;
    async function load() {
      const res = await fetch(`/api/auth/setup/preview?token=${encodeURIComponent(tokenFromUrl)}`);
      if (!res.ok) {
        setError("This setup link is invalid or expired. Enter your email to start again.");
        setStep("identify");
        return;
      }
      const preview = (await res.json()) as Preview;
      applyPreview(preview, tokenFromUrl);
    }
    void load();
  }, [tokenFromUrl]);

  function applyPreview(preview: Preview, nextToken: string) {
    setToken(nextToken);
    setEmail(preview.email);
    setName(preview.name);
    setPhone(preview.phone);
    setDateOfBirth(preview.dateOfBirth ?? "");
    setMedicalConditions(preview.medicalConditions ?? "");
    setAllergies(preview.allergies ?? "");
    setMedications(preview.medications ?? "");
    setEmergencyContact(preview.emergencyContact ?? "");
    setEmergencyPhone(preview.emergencyPhone ?? "");
    setImportedNotes(preview.importedNotes ?? "");
    setStep("profile");
  }

  async function startSetup(sendLink = false) {
    setError("");
    setMessage("");
    setLoading(true);
    const res = await fetch("/api/auth/setup/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone: phone || undefined, sendLink }),
    });
    const payload = (await res.json()) as {
      error?: string;
      token?: string;
      emailed?: boolean;
      message?: string;
      canEmailLink?: boolean;
      login?: boolean;
      name?: string;
      phone?: string;
      importedNotes?: string;
      email?: string;
    };
    setLoading(false);
    if (!res.ok) {
      setError(payload.error || "Could not start setup.");
      setCanEmailLink(Boolean(payload.canEmailLink));
      return;
    }
    if (payload.emailed) {
      setMessage(payload.message || "Check your email for a setup link.");
      return;
    }
    if (payload.token) {
      applyPreview(
        {
          email: payload.email || email,
          name: payload.name || "",
          phone: payload.phone || phone,
          importedNotes: payload.importedNotes || "",
        },
        payload.token,
      );
    }
  }

  async function completeSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/setup/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password,
        name,
        phone,
        dateOfBirth,
        medicalConditions,
        allergies,
        medications,
        emergencyContact,
        emergencyPhone,
      }),
    });
    const payload = (await res.json()) as { error?: string; email?: string };
    if (!res.ok) {
      setLoading(false);
      setError(payload.error || "Could not finish setup.");
      return;
    }
    const signInResult = await signIn("credentials", {
      email: payload.email || email,
      password,
      redirect: false,
    });
    if (signInResult?.error) {
      setLoading(false);
      setError("Account saved. Please sign in with your new password.");
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <div className="-mt-[1px]">
      <EditorialSection>
        <div className={`${editorialPanel} p-6 sm:p-8`}>
          <EditorialEyebrow>MEMBER ONBOARDING</EditorialEyebrow>
          <h1 className="mt-4 font-serif text-4xl text-[#1f1a15]">Create your password</h1>
          <p className="mt-3 max-w-2xl text-[#6f6251]">
            Existing KIAN clients can verify their email, choose a password, and share any medical details that help us
            care for you.
          </p>
        </div>

        {step === "identify" ? (
          <form
            className={`mt-8 space-y-4 ${editorialPanel} p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              void startSetup(false);
            }}
          >
            <h2 className="font-serif text-2xl text-[#1f1a15]">Verify your account</h2>
            <input
              className={editorialInput}
              type="email"
              required
              placeholder="Email on file"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={editorialInput}
              placeholder="Phone on file (or last 4 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-[#1b6568]">{message}</p> : null}
            <button type="submit" disabled={loading} className={`w-full ${editorialCtaPrimary}`}>
              {loading ? "CHECKING…" : "CONTINUE"}
            </button>
            {canEmailLink ? (
              <button
                type="button"
                disabled={loading}
                className={`w-full ${editorialCtaSecondary}`}
                onClick={() => void startSetup(true)}
              >
                EMAIL ME A SETUP LINK
              </button>
            ) : null}
            <p className="text-sm text-[#6f6251]">
              Already set a password?{" "}
              <Link href="/login" className="text-[#8f6f3e] underline">
                Sign in
              </Link>
              {" · "}
              <Link href="/forgot-password" className="text-[#8f6f3e] underline">
                Forgot password
              </Link>
            </p>
          </form>
        ) : (
          <form className={`mt-8 space-y-6 ${editorialPanel} p-6`} onSubmit={(e) => void completeSetup(e)}>
            <div>
              <h2 className="font-serif text-2xl text-[#1f1a15]">Your details</h2>
              <p className="mt-2 text-sm text-[#6f6251]">Choose a password and update anything that has changed.</p>
            </div>
            <div className={`${editorialPanel} p-3 text-sm text-[#6f6251]`}>
              <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">EMAIL</p>
              <p>{email}</p>
            </div>
            <input
              className={editorialInput}
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={editorialInput}
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className={editorialInput}
              type="password"
              required
              minLength={8}
              placeholder="Create a password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className={editorialInput}
              type="password"
              required
              minLength={8}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <div>
              <h3 className="font-serif text-xl text-[#1f1a15]">Health information</h3>
              <p className="mt-1 text-sm text-[#6f6251]">Optional, but it helps your care team. You can edit this later.</p>
            </div>
            <input
              className={editorialInput}
              placeholder="Date of birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <textarea
              className={`${editorialInput} min-h-24`}
              placeholder="Medical conditions"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
            />
            <textarea
              className={`${editorialInput} min-h-20`}
              placeholder="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
            <textarea
              className={`${editorialInput} min-h-20`}
              placeholder="Medications"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
            />
            <input
              className={editorialInput}
              placeholder="Emergency contact name"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
            <input
              className={editorialInput}
              placeholder="Emergency contact phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
            {importedNotes ? (
              <div className={`${editorialPanel} p-4 text-sm text-[#5f5344]`}>
                <p className="text-xs tracking-[0.14em] text-[#8f6f3e]">NOTES ALREADY ON FILE</p>
                <p className="mt-2 whitespace-pre-wrap">{importedNotes}</p>
              </div>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" disabled={loading} className={`w-full ${editorialCtaPrimary}`}>
              {loading ? "SAVING…" : "SAVE AND ENTER DASHBOARD"}
            </button>
          </form>
        )}
      </EditorialSection>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#6f6251]">Loading setup…</div>}>
      <WelcomeForm />
    </Suspense>
  );
}
