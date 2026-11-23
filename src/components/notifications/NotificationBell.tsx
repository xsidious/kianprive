"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
  unread: boolean;
};

type Props = {
  /** Compact icon for site header / portal bars */
  className?: string;
};

export function NotificationBell({ className = "" }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) return;
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = (await res.json()) as { notifications?: Notif[]; unreadCount?: number };
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // ignore transient errors
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    void load();
    if (status !== "authenticated") return;
    const id = window.setInterval(() => void load(), 45000);
    return () => window.clearInterval(id);
  }, [load, status]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, unread: false, readAt: n.readAt ?? new Date().toISOString() })));
  }

  async function openItem(n: Notif) {
    if (n.unread) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [n.id] }),
      });
      setItems((prev) =>
        prev.map((row) =>
          row.id === n.id ? { ...row, unread: false, readAt: new Date().toISOString() } : row,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  }

  if (status !== "authenticated" || !session?.user) return null;

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="relative inline-flex items-center p-2 text-[#5c4a32] transition hover:text-[#8a682e]"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={17} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a682e] px-1 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-sm border border-[#e4d9c8] bg-white shadow-md">
          <div className="flex items-center justify-between border-b border-[#efe4d4] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f6f3e]">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] text-[#8f6f3e] underline underline-offset-2"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[#6f6251]">No notifications yet.</li>
            ) : (
              items.map((n) => {
                const inner = (
                  <div className={`px-3 py-2.5 ${n.unread ? "bg-[#fffaf3]" : ""}`}>
                    <p className="text-sm font-medium text-[#1f1a15]">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[#6f6251]">{n.body}</p>
                    <p className="mt-1 text-[10px] text-[#8a7d6c]">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-[#f0e6d8] last:border-0">
                    {n.href ? (
                      <Link href={n.href} onClick={() => void openItem(n)} className="block hover:bg-[#faf6f0]">
                        {inner}
                      </Link>
                    ) : (
                      <button type="button" className="block w-full text-left hover:bg-[#faf6f0]" onClick={() => void openItem(n)}>
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-[#efe4d4] px-3 py-2">
            <Link
              href="/dashboard/intake"
              onClick={() => setOpen(false)}
              className="text-[11px] text-[#8f6f3e] underline underline-offset-2"
            >
              Open clinical intake
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
