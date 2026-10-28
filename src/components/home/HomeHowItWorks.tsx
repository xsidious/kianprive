import Link from "next/link";
import {
  EditorialEyebrow,
  editorialCtaPrimary,
  editorialCtaSecondary,
} from "@/components/ui/editorial-primitives";

const steps = [
  {
    title: "Book a consult",
    text: "Tell us your goals. Meet in our North Miami Beach suite, or by telemedicine.",
  },
  {
    title: "Get your plan",
    text: "Physicians and specialists map labs, treatments, and a clear next step—just for you.",
  },
  {
    title: "Begin care",
    text: "Start at our private suite or yours. We stay with you through every refill and follow-up.",
  },
];

export function HomeHowItWorks() {
  return (
    <div>
      <EditorialEyebrow>START HERE</EditorialEyebrow>
      <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Three simple steps</h2>
      <p className="mt-3 max-w-2xl text-[#6f6251]">No waiting rooms. No guesswork. A private path from first conversation to results.</p>
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.title}
            className="relative overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6 sm:p-7"
          >
            <h3 className="font-serif text-2xl text-[#1f1a15]">{step.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5f5344]">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/book-online" className={editorialCtaPrimary}>
          BOOK CONSULTATION
        </Link>
        <Link href="/services" className={editorialCtaSecondary}>
          EXPLORE SERVICES
        </Link>
      </div>
    </div>
  );
}
