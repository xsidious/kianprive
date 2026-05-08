import { cn } from "@/lib/utils";

export function SectionWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:py-10", className)}>{children}</section>;
}
