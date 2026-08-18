import { homepageStats } from "@/lib/site-content";

export function HomeStats() {
  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#e4d9c8] sm:grid-cols-3">
      {homepageStats.map((stat) => (
        <div key={stat.label} className="bg-[#fffcf7] px-6 py-7 text-center">
          <p className="font-serif text-3xl text-[#1f1a15] md:text-4xl">{stat.value}</p>
          <p className="mt-2 text-[11px] tracking-[0.16em] text-[#8f6f3e]">{stat.label.toUpperCase()}</p>
        </div>
      ))}
    </div>
  );
}
