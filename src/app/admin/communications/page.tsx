"use client";

import { useState } from "react";

export default function AdminCommunicationsPage() {
  const [status, setStatus] = useState("");

  async function sendEmail(formData: FormData) {
    setStatus("");
    const body = {
      to: String(formData.get("to") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };
    const response = await fetch("/api/admin/communications/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(response.ok ? "Email queued." : "Failed to queue email.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-[#1f1a15]">Communications</h1>
      <p className="text-[#6f6251]">Send outbound emails from the dedicated communications page.</p>

      <section className="rounded-2xl border border-[#b78d4b2d] bg-white p-5">
        <h2 className="text-xl text-[#1f1a15]">Send Email</h2>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendEmail(new FormData(event.currentTarget));
          }}
        >
          <input name="to" type="email" placeholder="Recipient email" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <input name="subject" placeholder="Subject" className="rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <textarea name="message" placeholder="Message" className="min-h-[150px] rounded-xl border border-[#b78d4b35] bg-[#fffaf4] p-3" required />
          <button className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">Send Email</button>
        </form>
        {status ? <p className="mt-3 text-sm text-[#8f6f3e]">{status}</p> : null}
      </section>
    </div>
  );
}
