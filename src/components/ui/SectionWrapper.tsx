import { cn } from "@/lib/utils";

export function SectionWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-20 lg:py-24", className)}>{children}</section>;
}
