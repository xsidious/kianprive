import { cn } from "@/lib/utils";

export function PremiumCard({
  title,
  description,
  featured,
}: {
  title: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-3xl border p-7 transition duration-300",
        featured
          ? "border-[#d7b676] bg-gradient-to-b from-[#2a2318] to-[#17120d]"
          : "border-[#d7b6764d] bg-[#13110f]",
      )}
    >
      <h3 className="text-lg text-[#f7efdf]">{title}</h3>
      <p className="mt-2 text-sm text-[#ede2cfb3]">{description}</p>
    </article>
  );
}
