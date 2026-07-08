"use client";

import { useEffect, useState } from "react";

type IntakeSubmission = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  programs: string[];
  status: string;
  createdAt: string;
};

const statuses = [
  "PENDING_REVIEW",
  "UNDER_PHYSICIAN_REVIEW",
  "APPROVED",
  "NEEDS_FOLLOW_UP",
  "DECLINED",
] as const;

export default function AdminIntakePage() {
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadSubmissions() {
    setLoading(true);
    const response = await fetch("/api/admin/intake/peptides-glp");
    if (!response.ok) {
      setMessage("Could not load intake submissions.");
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as { submissions: IntakeSubmission[] };
    setSubmissions(payload.submissions);
    setLoading(false);
  }

  useEffect(() => {
    void loadSubmissions();
  }, []);

  async function updateStatus(id: string, status: string) {
    const response = await fetch("/api/admin/intake/peptides-glp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      setMessage("Could not update intake status.");
      return;
    }
    setMessage("Status updated.");
    await loadSubmissions();
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">HIPAA-PROTECTED CLINICAL INTAKE</p>
      <h1 className="mt-2 text-3xl text-[#1f1a15]">Peptide &amp; GLP Intake Submissions</h1>
      <p className="mt-3 max-w-3xl text-sm text-[#6f6251]">
        Review secure therapeutics intake forms submitted from the public peptide / GLP intake workflow. Access is
        restricted to authorized KIAN Privé staff.
      </p>
      {message ? <p className="mt-4 text-sm text-[#1b6568]">{message}</p> : null}
      {loading ? (
        <p className="mt-6 text-sm text-[#6f6251]">Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p className="mt-6 text-sm text-[#6f6251]">No intake submissions yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#b78d4b2d] bg-white">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="border-b border-[#b78d4b2d] bg-[#fffaf2] text-xs tracking-[0.12em] text-[#8f6f3e]">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Programs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-[#b78d4b1f] align-top">
                  <td className="px-4 py-3 text-[#5f5344]">{new Date(submission.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#2b2218]">{submission.fullName}</p>
                    <p className="text-xs text-[#8f6f3e]">DOB: {submission.dateOfBirth}</p>
                  </td>
                  <td className="px-4 py-3 text-[#5f5344]">
                    <p>{submission.email}</p>
                    <p>{submission.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[#5f5344]">{submission.programs.join(", ")}</td>
                  <td className="px-4 py-3">
                    <select
                      value={submission.status}
                      onChange={(event) => void updateStatus(submission.id, event.target.value)}
                      className="rounded-lg border border-[#b78d4b35] bg-[#fffaf4] px-2 py-1 text-xs"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#5f5344]">{submission.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
