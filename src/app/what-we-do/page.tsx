import Link from "next/link";
import Image from "next/image";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { EditorialEyebrow, EditorialSection, editorialPanel } from "@/components/ui/editorial-primitives";

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
    image: "/images/icoone-treatment-session.webp",
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
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="WHAT WE DO"
        lineOne="One ecosystem."
        lineTwo="Many pathways."
        lineThree="One standard."
        description="Explore every part of the KIAN Privé ecosystem, from private wellness services to premium practitioner education."
        primaryCta={{ label: "View Services", href: "/services" }}
        secondaryCta={{ label: "Contact Us", href: "/contact" }}
        imageSrc="/images/wellness.avif"
        imageAlt="KIAN Privé wellness offerings"
      />

      <EditorialSection>
        <EditorialEyebrow>ECOSYSTEM</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Explore our offerings</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offerings.map((offering) => (
            <article key={offering.title} className={`overflow-hidden ${editorialPanel}`}>
              <div className="relative h-52">
                <Image src={offering.image} alt={offering.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl text-[#2b2218]">{offering.title}</h3>
                <p className="mt-2 text-sm text-[#6f6251]">{offering.description}</p>
                <Link href={offering.href} className="mt-4 inline-flex text-xs tracking-[0.16em] text-[#8f6f3e]">
                  LEARN MORE →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </EditorialSection>
    </div>
  );
}
