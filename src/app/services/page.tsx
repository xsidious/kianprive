import { SectionWrapper } from "@/components/ui/SectionWrapper";
import Link from "next/link";
import Image from "next/image";

const detailedServices = [
  {
    title: "Icoone® Laser — Lymphatic Drainage & Body Wellness",
    image: "/images/icoone.avif",
    description:
      "The revolutionary Icoone® Laser system uses patented Roboderm® technology with millions of micro-stimulations per session to activate the lymphatic system. For detoxification, it eliminates toxins and restores circulatory balance. For pain management, it relieves chronic tension and reduces inflammation. For athletes, it flushes metabolic waste, reduces recovery time, and enhances flexibility.",
  },
  {
    title: "Nutrition & Wellness Coaching",
    image: "/images/nutrition.avif",
    description:
      "Our certified nutrition specialists work alongside physicians to design individualized nutrition plans rooted in science and lifestyle. Whether your goals are weight optimization, gut health, hormonal balance, anti-aging, or sustained energy, we create strategies that work in harmony with your body from guided meal planning to nutraceutical recommendations.",
  },
  {
    title: "Korean & Organic Skincare",
    image: "/images/esthetics.avif",
    description:
      "KIAN Privé integrates the world-renowned wisdom of Korean skincare philosophy with certified organic formulations. Rooted in preventative care, deep hydration, and skin longevity, our bespoke skincare protocols honor your skin's natural barrier and deliver a luminous, healthy complexion free from harsh chemicals.",
  },
  {
    title: "Microneedling with Exosomes",
    image: "/images/facial-treatments.jpg",
    description:
      "Advanced microneedling enhanced by exosome therapy harnesses the power of cell-signaling molecules to promote tissue repair, collagen production, and cellular renewal dramatically improving skin texture, tone, fine lines, and overall radiance. The result is not just younger-looking skin, but genuinely healthier skin at the cellular level.",
  },
  {
    title: "Telemedicine & In-Home Doctor Visits",
    image: "/images/stock/hero-luxury-clinic.jpg",
    description:
      "KIAN Privé offers seamless telemedicine consultations with board-certified physicians from wherever you are. For a more hands-on experience, our concierge in-home doctor visits bring full KIAN Privé expertise directly to your door including medical evaluations, IV therapy, follow-up care, and wellness consultations on your terms and timeline.",
  },
  {
    title: "IV Therapy & Nutrient Optimization",
    image: "/images/wellness.avif",
    description:
      "Replenish, restore, and recharge with our physician-supervised intravenous therapy programs. Our custom-blended IV infusions deliver essential vitamins, minerals, antioxidants, and hydration directly into your bloodstream for maximum absorption and immediate results whether combating fatigue, supporting immunity, or optimizing athletic performance.",
  },
  {
    title: "Comprehensive Bloodwork & Diagnostics",
    image: "/images/medicalaesthetics.avif",
    description:
      "True wellness begins with knowledge. Our detailed, physician-reviewed bloodwork panels provide a complete picture of your internal health hormone levels, metabolic markers, nutrient deficiencies, and inflammatory indicators. Our doctors interpret your results and build a personalized wellness roadmap designed around your unique biology.",
  },
  {
    title: "Holistic Salt Therapy — Respiratory Wellness & Cellular Renewal",
    image: "/images/stock/service-wellness.jpg",
    description:
      "KIAN Privé is proud to partner with Holistic Salt Therapy, bringing the transformative power of pharmaceutical-grade halotherapy to our clients. Their specialized sessions deliver micro-particles of pure salt-infused air deep into the respiratory system, gently cleansing airways, supporting skin health, reducing inflammation, and activating the body’s natural detoxification pathways. Seamlessly integrated into your KIAN Privé wellness protocol, Holistic Salt Therapy sessions are curated as part of your personalized care plan.",
  },
  {
    title: "PEMF Therapy Bed — Cellular Recharge & Healing",
    image: "/images/stock/service-medical-aesthetics.jpg",
    description:
      "Pulsed Electromagnetic Field therapy uses targeted electromagnetic pulses to stimulate cellular repair, improve circulation, reduce inflammation, and restore the body's natural electromagnetic balance. Ideal for chronic pain, injury recovery, sleep disruption, and deep cellular optimization.",
  },
  {
    title: "FAR Infrared Sauna — Deep Detox & Regeneration",
    image: "/images/stock/service-esthetics.jpg",
    description:
      "Our FAR infrared saunas penetrate deep into body tissues, raising core temperature from within to promote elimination of heavy metals, environmental toxins, and metabolic waste. Sessions improve cardiovascular function, relieve joint and muscle pain, support skin health, and induce deep relaxation.",
  },
  {
    title: "Cold Plunge — Recovery, Resilience & Vitality",
    image: "/images/stock/service-nutrition.jpg",
    description:
      "Cold water immersion powerfully reduces inflammation, accelerates muscle recovery, boosts circulation, elevates mood through endorphin release, and strengthens systemic resilience. Each session is thoughtfully integrated into your broader wellness protocol for maximum therapeutic benefit.",
  },
  {
    title: "Wellness Gym Access",
    image: "/images/stock/service-beauty-salon.jpg",
    description:
      "KIAN Privé clients enjoy exclusive access to our fully equipped wellness gym, available on a flexible per-visit basis or as part of a dedicated membership. Designed for functional training, rehabilitative movement, and performance optimization the perfect complement to your recovery and wellness therapies.",
  },
  {
    title: "MINDTAP — Mental Performance Coaching",
    image: "/images/beauty.avif",
    description:
      "KIAN Privé is proud to partner with MINDTAP, an elite team of Mental Performance Coaches specializing in Sport Psychology and Perceptual-Cognitive Training. Whether you are a competitive athlete seeking a mental edge, a high-performing executive navigating pressure and decision-making at the highest level, or an individual committed to optimizing every dimension of your performance, MINDTAP coaches work with you to sharpen focus, build mental resilience, enhance reaction time, and unlock the full cognitive potential that separates good from extraordinary. The mind is the most powerful performance tool you have MINDTAP helps you train it.",
  },
  {
    title: "Medication Therapy Management — Personalized Medication Optimization",
    image: "/images/stock/hero-luxury-clinic.jpg",
    description:
      "KIAN Privé’s Medication Therapy Management (MTM) service pairs you with a clinical expert who conducts a comprehensive review of your medications, supplements, and treatment protocols to ensure everything you take is working optimally together. Your initial consultation establishes a complete medication review and a personalized action plan. Ongoing follow-up visits keep your protocol precisely calibrated as your health evolves. For clients seeking year-round, uninterrupted medication oversight, our Annual MTM Package delivers priority telemedicine access, full medication review and reconciliation, and a 10% discount across all additional KIAN Privé services.",
  },
  {
    title: "GLP-1s, Peptides & Nutraceuticals — Advanced Therapeutic Support",
    image: "/images/nutrition.avif",
    description:
      "KIAN Privé offers physician-supervised access to GLP-1 receptor agonists, targeted peptide therapies, and premium nutraceutical protocols as powerful complements to your existing wellness plan. GLP-1 therapies support metabolic health and weight optimization. Peptide therapies are selected based on your individual goals from cellular repair and recovery to hormonal balance and cognitive performance. Nutraceuticals are curated and dosed with the same clinical precision applied to every aspect of your KIAN Privé experience. All protocols are personalized in consultation with your physician and priced individually based on your specific therapeutic needs. These are offered as an additional service and are not included in standard membership pricing.",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <SectionWrapper className="pt-18">
        <div className="grid items-center gap-10 rounded-3xl border border-[#b78d4b2e] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(66,45,14,0.45)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">PRIVÉ SERVICES</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-5xl">Luxury Wellness Services Designed Around Your Goals</h1>
            <p className="mt-5 max-w-2xl text-[#6f6251]">
              From concierge physician support and advanced aesthetics to performance recovery and nutrition optimization, each service is
              delivered as part of one integrated protocol personalized to your body and lifestyle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book-online" className="rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                Book Services
              </Link>
              <Link href="/pricing" className="rounded-full border border-[#b78d4b70] bg-[#fffaf2] px-5 py-2 text-sm text-[#3b3024]">
                View Membership
              </Link>
            </div>
          </div>
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[#b78d4b36]">
            <Image src="/images/wellness.avif" alt="KIAN Privé services overview" fill className="object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <h2 className="mb-2 text-3xl text-[#1f1a15] md:text-4xl">Our Services</h2>
        <p className="mb-6 max-w-3xl text-[#6f6251]">
          Clinically grounded, hospitality-led, and designed for measurable transformation. Explore the complete KIAN Privé service suite.
        </p>
        <div className="space-y-6">
          {detailedServices.map((service, index) => (
            <article
              key={service.title}
              className="grid gap-6 overflow-hidden rounded-3xl border border-[#b78d4b2d] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] md:grid-cols-[0.42fr_0.58fr] md:items-start"
            >
              <div className="relative h-64 overflow-hidden rounded-2xl">
                <Image src={service.image} alt={service.title} fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">SERVICE {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-2xl text-[#2b2218]">{service.title}</h3>
                <p className="mt-4 leading-relaxed text-[#5f5344]">{service.description}</p>
                <Link href="/book-online" className="mt-5 inline-flex rounded-full bg-[#b78d4b] px-5 py-2 text-sm text-white">
                  Book Now
                </Link>
              </div>
            </article>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
