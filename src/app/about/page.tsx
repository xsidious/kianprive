import type { Metadata } from "next";
import Image from "next/image";
import { CinematicHero } from "@/components/ui/CinematicHero";
import { pageHeroes } from "@/lib/media/heroes";
import { EditorialEyebrow, EditorialSection, editorialPanel } from "@/components/ui/editorial-primitives";
import { getCmsPageContent } from "@/lib/cms/pages";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCmsPageContent("about");
  return buildSeoMetadata({
    title: cms.seoTitle || "About KIAN Privé",
    description:
      cms.seoDescription ||
      "Meet the KIAN Privé team — physician-led concierge wellness, clinical aesthetics, and regenerative care in Miami and North Miami Beach.",
    canonicalPath: cms.canonicalUrl?.startsWith("/") ? cms.canonicalUrl : "/about",
    image: cms.seoImage || "/images/og-default.jpg",
    noIndex: Boolean(cms.noIndex),
  });
}

const aboutTeam = [
  { name: "Alycia Lerer", title: "Founder", subtitle: "Wellness Coach", image: "/images/AlyciaLerer.png" },
  { name: "Cherie Johnson", title: "Co-Founder", subtitle: "Nutritionist", image: "/images/NutritionServices.jpeg" },
  { name: "Chyle Beaird, M.D.", title: "Medical Director", subtitle: "Physician", image: "/images/ChyleBeaird.avif" },
  { name: "Jacqueline Hayes", title: "Pharmacy Technician", subtitle: "Clinical Support", image: "/images/JacquelineHayes.png" },
  { name: "Dr. Karl Ryan, DDS", title: "Aesthetic Injector", subtitle: "Provider", image: "/images/KarlRyan.avif" },
  {
    name: "Carolina Millan",
    title: "Director of Business Affairs",
    subtitle: "Operations Leadership",
    image: "/images/CarolinaMillan.png",
  },
  {
    name: "Dr. John Maarouf, DO",
    title: "Concierge and Telemedicine",
    subtitle: "Family & Sports Medicine",
    image: "/images/JohnMaarouf.jpeg",
    bio: "Dr. Maarouf is a dual board certified physician in Family and Sports Medicine who specializes in non surgical orthopedics and orthobiologics to remedy common injuries for every level of athlete like knee pain, meniscus injuries, rotator cuff tears, tennis/golfers elbow, plantar fasciitis and more. With a calm presence, sharp diagnostics, and an eye for detail, Dr. Maarouf guides personalized care that gets results.",
  },
  {
    name: "Dr. Carmen Ramirez",
    title: "Physician",
    subtitle: "Clinical Care",
    image: "/images/CarmenRamirez.png",
  },
];

export default async function AboutPage() {
  const cms = await getCmsPageContent("about");
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow={cms.eyebrow ?? "ABOUT US"}
        lineOne="A private sanctuary."
        lineTwo="A clinical standard."
        lineThree="A personal journey."
        description={
          cms.description ??
          "At KIAN Privé, optimal health is a continuous, deeply personal journey—clinical medicine, advanced skincare, regenerative therapies, and luxury wellness in one seamless experience."
        }
        primaryCta={{ label: "Meet the Team", href: "#team" }}
        secondaryCta={{ label: "Book Consultation", href: "/book-online" }}
        imageSrc={pageHeroes.about.src}
        imageAlt={pageHeroes.about.alt}
        priority={false}
      />

      <EditorialSection>
        <EditorialEyebrow>OUR APPROACH</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Your Pathway to Greatness</h2>
        <p className="mt-3 max-w-4xl text-[#6f6251]">
          KIAN Privé provides a comprehensive approach to achieving maximum mental and physical wellness. Our framework encourages
          individuals to:
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "Assess Their Current Lifestyle: Evaluate existing habits and identify areas for improvement.",
            "Set Personal Goals: Establish clear, achievable health and wellness goals.",
            "Implement Changes: Integrate new practices and products into daily routines for a balanced lifestyle.",
            "Monitor Progress: Regularly review and adjust goals and practices to ensure continued growth and success.",
            "Celebrate Achievements: Recognize and celebrate milestones along the wellness journey to maintain motivation and commitment.",
          ].map((item) => (
            <article key={item} className={`${editorialPanel} p-4 text-[#4f4335]`}>
              {item}
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>CORE VALUES</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">What we stand for</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Commitment",
              text: "We believe in the power of dedication to achieving wellness and encourage accountability and perseverance.",
            },
            {
              title: "Clarity",
              text: "Understanding is the first step towards change. We provide clear guidance so clients can make informed decisions.",
            },
            {
              title: "Consistency",
              text: "Lasting wellness requires consistent effort, sustainable habits, and daily practices that support body and mind.",
            },
            {
              title: "Change",
              text: "Growth requires transformation. We guide clients with support and resources through every phase of improvement.",
            },
          ].map((value) => (
            <article key={value.title} className={`${editorialPanel} p-5`}>
              <h3 className="font-serif text-xl text-[#2b2218]">{value.title}</h3>
              <p className="mt-3 text-[#6f6251]">{value.text}</p>
            </article>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection id="team">
        <EditorialEyebrow>THE TEAM</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">Meet The Team</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {aboutTeam.map((member) => (
            <article key={member.name} className={`${editorialPanel} p-4`}>
              <div className="relative h-60 overflow-hidden rounded-sm border border-[#e4d9c8] bg-[#f7efe3]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 20vw"
                  className={member.name === "Dr. Karl Ryan, DDS" ? "object-contain object-center p-0" : "object-contain object-top p-2"}
                />
              </div>
              <p className="mt-4 text-lg text-[#2b2218]">{member.name}</p>
              <p className="text-sm text-[#6f6251]">{member.title}</p>
              <p className="text-xs text-[#8f6f3e]">{member.subtitle}</p>
              {"bio" in member ? <p className="mt-3 text-sm leading-relaxed text-[#5f5344]">{member.bio}</p> : null}
            </article>
          ))}
        </div>
      </EditorialSection>
    </div>
  );
}
