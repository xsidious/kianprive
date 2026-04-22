import { ShieldCheck, Stethoscope, Star, UserCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "HIPAA-Aware Privacy" },
  { icon: Stethoscope, label: "Clinically Guided Care" },
  { icon: UserCheck, label: "Concierge-Level Support" },
  { icon: Star, label: "Premium Member Experience" },
];

export function TrustBadges() {
  return (
    <div className="border-b border-[#b78d4b22] bg-[#fffaf2]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        {badges.map((badge) => (
          <div key={badge.label} className="inline-flex items-center gap-2 text-center text-[11px] text-[#5f5344] sm:text-xs md:text-sm">
            <badge.icon size={16} className="text-[#8f6f3e]" />
            <span>{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
