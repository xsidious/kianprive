"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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
  /** Who is composing in this thread — used for optimistic insert. */
  selfAuthorRole?: "PROVIDER" | "PATIENT";
  selfAuthorLabel?: string;
  loadMessages: () => Promise<ThreadMessage[]>;
  sendMessage: (body: string) => Promise<ThreadMessage>;
  initialMessages?: ThreadMessage[];
  /** Change only when switching intakes — avoid tying to statusNote */
  reloadKey?: string | number;
  pollIntervalMs?: number;
};

function normalizeList(rows: unknown): ThreadMessage[] {
  if (!Array.isArray(rows)) return [];
  return rows.filter((row): row is ThreadMessage => {
    return Boolean(row && typeof row === "object" && "id" in row && "body" in row);
  });
}

function mergeById(prev: ThreadMessage[], next: ThreadMessage[]) {
  if (!next.length && prev.length) return prev;
  const map = new Map<string, ThreadMessage>();
  for (const row of prev) map.set(row.id, row);
  for (const row of next) map.set(row.id, row);
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function replaceOptimistic(prev: ThreadMessage[], tempId: string, created: ThreadMessage) {
  const withoutTemp = prev.filter((row) => row.id !== tempId);
  return mergeById(withoutTemp, [created]);
}

export function IntakeMessageThread({
  title = "Messages",
  hint = "Ask for labs, documents, or clarifications. The patient can reply here.",
  placeholder = "What else do they need to send or do?",
  submitLabel = "Send message",
  selfAuthorRole = "PROVIDER",
  selfAuthorLabel,
  loadMessages,
  sendMessage,
  initialMessages,
  reloadKey,
  pollIntervalMs = 3000,
}: Props) {
  const [messages, setMessages] = useState<ThreadMessage[]>(() => normalizeList(initialMessages));
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const loadRef = useRef(loadMessages);
  const stickBottom = useRef(true);
  const mounted = useRef(true);
  const sentTimer = useRef<number | null>(null);

  loadRef.current = loadMessages;

  function scrollToBottom(smooth = false) {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }

  function flashSent() {
    setJustSent(true);
    if (sentTimer.current) window.clearTimeout(sentTimer.current);
    sentTimer.current = window.setTimeout(() => {
      if (mounted.current) setJustSent(false);
    }, 2200);
  }

  async function refresh(opts?: { silent?: boolean }) {
    const silent = Boolean(opts?.silent);
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const rows = normalizeList(await loadRef.current());
      if (!mounted.current) return;
      setMessages((prev) => {
        // Keep in-flight optimistic rows until the real message arrives
        const optimistic = prev.filter((row) => row.id.startsWith("temp-"));
        return mergeById(rows, optimistic);
      });
      setLive(true);
      setLastSyncedAt(new Date());
      setError("");
      if (stickBottom.current) {
        requestAnimationFrame(() => scrollToBottom(silent));
      }
    } catch (err) {
      if (!mounted.current) return;
      setLive(false);
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not load messages.");
      }
    } finally {
      if (mounted.current && !silent) setLoading(false);
    }
  }

  // Initial + when intake changes
  useEffect(() => {
    mounted.current = true;
    setMessages(normalizeList(initialMessages));
    setJustSent(false);
    void refresh({ silent: false });
    return () => {
      mounted.current = false;
      if (sentTimer.current) window.clearTimeout(sentTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only remount/reload when intake key changes
  }, [reloadKey]);

  // Near-live polling
  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs < 1500) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refresh({ silent: true });
    };

    const timer = setInterval(tick, pollIntervalMs);
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, pollIntervalMs]);

  function onListScroll() {
    const el = listRef.current;
    if (!el) return;
    stickBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ThreadMessage = {
      id: tempId,
      authorRole: selfAuthorRole,
      authorLabel: selfAuthorLabel || (selfAuthorRole === "PATIENT" ? "You" : "Clinical team"),
      body: text,
      createdAt: new Date().toISOString(),
    };

    setBusy(true);
    setError("");
    setBody("");
    setMessages((prev) => mergeById(prev, [optimistic]));
    stickBottom.current = true;
    requestAnimationFrame(() => scrollToBottom(true));

    try {
      const created = await sendMessage(text);
      const normalized = normalizeList([created])[0];
      if (!normalized) {
        throw new Error("Message sent but response was empty. Refreshing…");
      }
      setMessages((prev) => replaceOptimistic(prev, tempId, normalized));
      flashSent();
      requestAnimationFrame(() => scrollToBottom(true));
      window.setTimeout(() => void refresh({ silent: true }), 400);
    } catch (err) {
      setMessages((prev) => prev.filter((row) => row.id !== tempId));
      setBody(text);
      setError(err instanceof Error ? err.message : "Could not send message.");
      void refresh({ silent: true });
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  const buttonLabel = justSent ? "Sent" : busy ? "Sending…" : submitLabel;

  return (
    <section className="space-y-4 rounded-2xl border border-[#e7dcc8] bg-[#fcfaf6] p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl text-[#1f1a15]">{title}</h2>
          <p className="mt-1 text-sm text-[#6f6251]">{hint}</p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${live ? "bg-[#1b6568]" : "bg-[#c4b7a4]"}`}
              aria-hidden
            />
            {live ? "Live updates" : loading ? "Loading…" : "Reconnecting…"}
          </p>
          {lastSyncedAt ? (
            <p className="mt-0.5 text-[10px] text-[#8a7d6c]">Synced {lastSyncedAt.toLocaleTimeString()}</p>
          ) : null}
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={onListScroll}
        className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-[#efe6d8] bg-white p-3"
      >
        {loading && messages.length === 0 ? (
          <p className="text-sm text-[#6f6251]">Loading messages…</p>
        ) : null}
        {!loading && messages.length === 0 ? (
          <p className="text-sm text-[#8a7d6c]">No messages yet on this request.</p>
        ) : null}
        {messages.map((msg) => {
          const fromPatient = msg.authorRole === "PATIENT";
          const pending = msg.id.startsWith("temp-");
          return (
            <article
              key={msg.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                fromPatient ? "ml-6 bg-[#f3f0ea] text-[#1f1a15]" : "mr-6 bg-[#f7f1e6] text-[#1f1a15]"
              } ${pending ? "opacity-80" : ""}`}
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6f3e]">
                {msg.authorLabel}
                <span className="ml-2 normal-case tracking-normal text-[#8a7d6c]">
                  {pending ? "Sending…" : new Date(msg.createdAt).toLocaleString()}
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
            required={!busy && !justSent}
            disabled={busy}
            className="mt-1.5 w-full rounded-lg border border-[#e0d4c0] bg-white px-3 py-2 text-sm text-[#1f1a15] disabled:opacity-70"
            placeholder={placeholder}
          />
        </label>
        <button
          type="submit"
          disabled={busy || (!body.trim() && !justSent)}
          className={`rounded-full border px-5 py-2.5 text-sm text-white transition disabled:opacity-60 ${
            justSent
              ? "border-[#2f6b3a] bg-[#2f6b3a]"
              : "border-[#8f6f3e] bg-[#8f6f3e]"
          }`}
        >
          {buttonLabel}
        </button>
      </form>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
