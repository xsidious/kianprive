"use client";

import { FormEvent, useEffect, useState } from "react";

export type ThreadMessage = {
  id: string;
  authorRole: "PROVIDER" | "PATIENT" | "SYSTEM";
  authorLabel: string;
  body: string;
  createdAt: string;
};

type Props = {
  title?: string;
  hint?: string;
  placeholder?: string;
  submitLabel?: string;
  loadMessages: () => Promise<ThreadMessage[]>;
  sendMessage: (body: string) => Promise<ThreadMessage>;
  /** Reload trigger from parent (e.g. after status change) */
  reloadKey?: string | number;
};

export function IntakeMessageThread({
  title = "Messages",
  hint = "Ask for labs, documents, or clarifications. The patient can reply here.",
  placeholder = "What else do they need to send or do?",
  submitLabel = "Send message",
  loadMessages,
  sendMessage,
  reloadKey,
}: Props) {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const rows = await loadMessages();
      setMessages(rows);
    } catch {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const created = await sendMessage(body.trim());
      setMessages((prev) => [...prev, created]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-5">
      <div>
        <h2 className="font-serif text-xl text-[#1f1a15]">{title}</h2>
        <p className="mt-1 text-sm text-[#6f6251]">{hint}</p>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-[#efe6d8] bg-white p-3">
        {loading ? <p className="text-sm text-[#6f6251]">Loading messages…</p> : null}
        {!loading && messages.length === 0 ? (
          <p className="text-sm text-[#8a7d6c]">No messages yet on this request.</p>
        ) : null}
        {messages.map((msg) => {
          const fromPatient = msg.authorRole === "PATIENT";
          return (
            <article
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                fromPatient ? "ml-6 bg-[#f3f0ea] text-[#1f1a15]" : "mr-6 bg-[#f7f1e6] text-[#1f1a15]"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                {msg.authorLabel}
                <span className="ml-2 normal-case tracking-normal text-[#8a7d6c]">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
            </article>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-xs uppercase tracking-[0.16em] text-[#8f6f3e]">
          Your message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={4000}
            required
            className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2 text-sm text-[#1f1a15]"
            placeholder={placeholder}
          />
        </label>
        <button
          type="submit"
          disabled={busy || !body.trim()}
          className="rounded-full border border-[#8f6f3e] bg-[#8f6f3e] px-5 py-2.5 text-sm text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : submitLabel}
        </button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
