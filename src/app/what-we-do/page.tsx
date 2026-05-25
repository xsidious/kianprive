import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";

const offerings = [
  {
    title: "Privé Services",
    description: "Comprehensive concierge wellness services blending medicine, aesthetics, and recovery.",
    href: "/services",
    image: "/images/wellness.avif",
  },
  {
    title: "About Us",
    description: "Learn the KIAN Privé mission, philosophy, and multidisciplinary care model.",
    href: "/about",
    image: "/images/esthetics.avif",
  },
  {
    title: "Corporate Wellness",
    description: "High-performance wellness programs built for teams, leaders, and organizations.",
    href: "/corporate-wellness",
    image: "/images/medicalaesthetics.avif",
  },
  {
    title: "Icoone® Lymphatic Drainage",
    description: "Facility-based Icoone® lymphatic drainage and certified practitioner training pathways.",
    href: "/icoone-training",
    image: "/images/icoone-treatment-session.png",
  },
  {
    title: "Practitioners",
    description: "Specialized certification tracks for clinical professionals and med spa teams.",
    href: "/practitioners",
    image: "/images/nutrition.avif",
  },
  {
    title: "Athletes",
    description: "Members-only performance and recovery resources for athletes.",
    href: "/athletes",
    image: "/images/stock/service-wellness.jpg",
  },
];

export default function WhatWeDoPage() {
  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)]">
          <h1 className="text-4xl text-[#1f1a15] md:text-5xl">What We Do</h1>
          <p className="mt-4 max-w-3xl text-[#6f6251]">
            Explore every part of the KIAN Privé ecosystem, from private wellness services to premium practitioner education.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offerings.map((offering) => (
            <article key={offering.title} className="overflow-hidden rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)]">
              <div className="relative h-52">
                <Image src={offering.image} alt={offering.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl text-[#2b2218]">{offering.title}</h2>
                <p className="mt-3 text-[#6f6251]">{offering.description}</p>
                <Link href={offering.href} className="mt-5 inline-flex rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white">
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
