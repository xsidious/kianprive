"use client";

import type { ReactNode } from "react";

const fieldClass =
  "mt-1 w-full rounded-xl border border-[#b78d4b35] bg-[#fffaf4] px-3 py-2.5 text-sm text-[#2b2218] outline-none focus:border-[#b78d4b]";
const labelClass = "text-sm font-medium text-[#3b3024]";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#8f6f3e]">{hint}</span> : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={fieldClass}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={fieldClass}
    />
  );
}

export function CheckboxGroup({
  options,
  selected,
  onChange,
  exclusiveOption,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  exclusiveOption?: string;
}) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
              checked ? "border-[#b78d4b] bg-[#fff6e8] text-[#3b3024]" : "border-[#b78d4b2d] bg-white text-[#5f5344]"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                let next: string[];
                if (exclusiveOption && option === exclusiveOption) {
                  next = checked ? [] : [exclusiveOption];
                } else if (checked) {
                  next = selected.filter((item) => item !== option);
                } else {
                  next = exclusiveOption
                    ? [...selected.filter((item) => item !== exclusiveOption), option]
                    : [...selected, option];
                }
                onChange(next);
              }}
              className="mt-0.5"
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "yes" | "no" | undefined;
  onChange: (value: "yes" | "no") => void;
}) {
  return (
    <Field label={label}>
      <div className="mt-2 flex gap-3">
        {(["yes", "no"] as const).map((option) => (
          <label key={option} className="inline-flex items-center gap-2 text-sm text-[#4f4335]">
            <input
              type="radio"
              name={label}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option === "yes" ? "Yes" : "No"}
          </label>
        ))}
      </div>
    </Field>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl text-[#1f1a15]">{title}</h2>
      {description ? <p className="mt-2 text-sm text-[#6f6251]">{description}</p> : null}
    </div>
  );
}
