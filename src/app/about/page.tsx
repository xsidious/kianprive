import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Image from "next/image";
import { getCmsPageContent } from "@/lib/cms/pages";

const aboutTeam = [
  { name: "Alycia Lerer", title: "Founder", subtitle: "Wellness Coach", image: "/images/AlyciaLerer.avif" },
  { name: "Cherie Johnson", title: "Co-Founder", subtitle: "Nutritionist", image: "/images/CherieJohnson.avif" },
  { name: "Chyle Beaird, M.D.", title: "Medical Director", subtitle: "Physician", image: "/images/ChyleBeaird.avif" },
  { name: "Jacquiline Hayes", title: "Pharmacy Technician", subtitle: "Clinical Support", image: "/images/JacquilineHayes.avif" },
  { name: "Dr. Karl Ryan, DDS", title: "Aesthetic Injector", subtitle: "Provider", image: "/images/KarlRyan.avif" },
];

export default async function AboutPage() {
  const cms = await getCmsPageContent("about");
  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">{cms.eyebrow ?? "ABOUT US"}</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">{cms.title}</h1>
            <p className="mt-5 max-w-3xl text-[#6f6251]">
              {cms.description}
            </p>
            <p className="mt-4 max-w-3xl text-[#6f6251]">
              At KIAN Privé, we believe optimal health is not a destination, it is a continuous, deeply personal journey. We bring together
              a distinguished team of physicians, registered nurses, licensed aestheticians, certified nutrition experts, and wellness
              specialists to deliver a seamless fusion of clinical medicine, advanced skincare, regenerative therapies, and luxury wellness
              tailored to every individual who walks through our doors.
            </p>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/stock/hero-luxury-clinic.jpg" alt="KIAN Privé team and wellness sanctuary" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_16px_40px_-35px_rgba(66,45,14,0.45)]">
          <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Your Pathway to Greatness</h2>
          <p className="max-w-4xl text-[#6f6251]">
            KIAN Privé provides a comprehensive approach to achieving maximum mental and physical wellness. Our framework encourages
            individuals to:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Assess Their Current Lifestyle: Evaluate existing habits and identify areas for improvement.",
              "Set Personal Goals: Establish clear, achievable health and wellness goals.",
              "Implement Changes: Integrate new practices and products into daily routines for a balanced lifestyle.",
              "Monitor Progress: Regularly review and adjust goals and practices to ensure continued growth and success.",
              "Celebrate Achievements: Recognize and celebrate milestones along the wellness journey to maintain motivation and commitment.",
            ].map((item) => (
              <article key={item} className="rounded-xl border border-[#b78d4b2e] bg-[#fffaf2] p-4 text-[#4f4335]">
                {item}
              </article>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-6 text-3xl text-[#1f1a15] md:text-4xl">Core Values</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <article key={value.title} className="rounded-2xl border border-[#b78d4b2e] bg-white p-5 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <h3 className="text-xl text-[#2b2218]">{value.title}</h3>
              <p className="mt-3 text-[#6f6251]">{value.text}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-6 text-3xl text-[#1f1a15] md:text-4xl">Meet The Team</h2>
        <div className="grid gap-6 md:grid-cols-5">
          {aboutTeam.map((member) => (
            <article key={member.name} className="rounded-2xl border border-[#b78d4b2e] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.45)]">
              <div className="relative h-56 overflow-hidden rounded-xl">
                <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 100vw, 20vw" className="object-cover" />
              </div>
              <p className="mt-4 text-lg text-[#2b2218]">{member.name}</p>
              <p className="text-sm text-[#6f6251]">{member.title}</p>
              <p className="text-xs text-[#8f6f3e]">{member.subtitle}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
