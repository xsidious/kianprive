"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "kian-a11y-prefs";

type Prefs = {
  largeText: boolean;
  highContrast: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
};

const defaults: Prefs = {
  largeText: false,
  highContrast: false,
  underlineLinks: false,
  reduceMotion: false,
};

function applyPrefs(prefs: Prefs) {
  const root = document.documentElement;
  root.classList.toggle("a11y-large-text", prefs.largeText);
  root.classList.toggle("a11y-high-contrast", prefs.highContrast);
  root.classList.toggle("a11y-underline-links", prefs.underlineLinks);
  root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
}

export function AccessibilityWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(defaults);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = { ...defaults, ...(JSON.parse(raw) as Partial<Prefs>) };
      setPrefs(parsed);
      applyPrefs(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  function update(next: Prefs) {
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function toggle(key: keyof Prefs) {
    update({ ...prefs, [key]: !prefs[key] });
  }

  function reset() {
    update(defaults);
  }

  return (
    <div className="mobile-chrome-float fixed bottom-6 left-4 z-[60] sm:left-6">
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Accessibility options"
          className="mb-2 w-[min(100vw-2rem,20rem)] rounded-sm border border-[#b78d4b44] bg-[#fffaf2] p-4 text-sm text-[#3b3024] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]"
        >
          <p className="text-xs tracking-[0.16em] text-[#7a5c32]">DISPLAY OPTIONS</p>
          <ul className="mt-3 space-y-2">
            {(
              [
                ["largeText", "Larger text"],
                ["highContrast", "High contrast"],
                ["underlineLinks", "Underline links"],
                ["reduceMotion", "Reduce motion"],
              ] as const
            ).map(([key, label]) => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={() => toggle(key)}
                    className="size-4 accent-[#8a682e]"
                  />
                  <span>{label}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <button type="button" onClick={reset} className="underline underline-offset-2 hover:text-[#8f6f3e]">
              Reset
            </button>
            <Link href="/accessibility" className="underline underline-offset-2 hover:text-[#8f6f3e]" onClick={() => setOpen(false)}>
              Accessibility statement
            </Link>
            <Link href="/email-preferences" className="underline underline-offset-2 hover:text-[#8f6f3e]" onClick={() => setOpen(false)}>
              Email opt-out
            </Link>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Accessibility options"
        title="Accessibility"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-[#8a682e66] bg-[#1f1a15] text-lg leading-none text-[#f6f1e7] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)]"
      >
        <span aria-hidden>♿</span>
      </button>
    </div>
  );
}
