import Link from "next/link";
import Image from "next/image";
import { IcooneMediaGallery } from "@/components/services/IcooneMediaGallery";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { getIcooneImage, icoonePrimaryImage } from "@/lib/media/icoone";

const benefits = [
  {
    title: "Lymphatic Drainage",
    description:
      "Icoone enhances lymphatic circulation, helping remove toxins and excess fluids from tissues, reducing swelling and promoting detoxification.",
  },
  {
    title: "Skin Tightening",
    description:
      "Stimulation of collagen and elastin production improves skin elasticity and firmness, supporting visible tightening outcomes.",
  },
  {
    title: "Cellulite Reduction",
    description:
      "By improving circulation and supporting tissue quality, Icoone can help reduce the appearance of cellulite.",
  },
  {
    title: "Pain Relief",
    description:
      "The gentle massage effect can alleviate muscle tension and soreness, supporting comfort and recovery.",
  },
];

const inflammationSupport = [
  {
    title: "Improved Circulation",
    description:
      "Increased blood flow helps deliver oxygen and nutrients to tissues, supporting healing and reducing inflammation.",
  },
  {
    title: "Enhanced Lymphatic Function",
    description:
      "Stimulation of the lymphatic system supports elimination of waste products and excess fluids linked to inflammation.",
  },
  {
    title: "Release of Endorphins",
    description:
      "Sessions can trigger natural pain-relieving endorphins that reduce discomfort associated with inflammatory stress.",
  },
  {
    title: "Reduction of Muscle Tension",
    description:
      "Relaxing tight muscles and improving mobility can help reduce inflammation related to strain or overuse.",
  },
];

export default function IcooneTrainingPage() {
  return (
    <SectionWrapper className="relative">
      <div>
        <div className="grid overflow-hidden rounded-3xl border border-[#b78d4b2e] bg-white md:grid-cols-[1.15fr_0.85fr]">
          <div className="p-8 md:p-14">
            <p className="text-xs tracking-[0.3em] text-[#8f6f3e]">ICOONE</p>
            <h1 className="mt-4 text-4xl text-[#1f1a15] md:text-6xl">Icoone® Lymphatic Drainage</h1>
            <p className="mt-4 text-lg text-[#5f5344]">
              Icoone is a non-invasive treatment that utilizes advanced robotic technology to perform micro-stimulation of the skin and
              underlying tissues. It is primarily known for body contouring, lymphatic drainage, and skin tightening.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/contact" className="rounded-full bg-[#b78d4b] px-5 py-2 text-white">
                Learn More
              </Link>
              <Link href="/book-online" className="rounded-full border border-[#b78d4b80] bg-[#fffaf2] px-5 py-2 text-[#3b3024]">
                Book Now
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px]">
            <Image src={icoonePrimaryImage} alt="Icoone lymphatic drainage session" fill className="object-cover" />
          </div>
        </div>

        <div className="mt-12 space-y-10">
          <section>
            <div className="grid items-center gap-8 rounded-3xl border border-[#b78d4b2d] bg-white p-8 shadow-[0_18px_45px_-35px_rgba(66,45,14,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <h2 className="text-3xl text-[#1f1a15] md:text-4xl">Icoone Therapy – FDA Approved for Wellness and Aesthetic Care</h2>
                <p className="mt-4 text-[#5f5344]">
                  Icoone is an FDA Approved device offering a versatile and effective treatment for both aesthetic and therapeutic
                  applications. It supports body contouring, skin tightening, and plays a vital role in reducing inflammation.
                </p>
                <p className="mt-3 text-[#5f5344]">
                  By stimulating lymphatic drainage, enhancing circulation, and promoting healthier skin, Icoone therapy becomes a powerful
                  tool in any comprehensive wellness program.
                </p>
                <p className="mt-3 text-sm text-[#6f6251]">
                  As with any treatment, we recommend consulting with a qualified healthcare professional to ensure it aligns with your
                  personal health goals and needs.
                </p>
              </div>
              <div className="relative h-[320px] overflow-hidden rounded-2xl border border-[#b78d4b2d]">
                <Image src={getIcooneImage(3).src} alt={getIcooneImage(3).alt} fill className="object-cover" />
              </div>
            </div>
          </section>

          <section>
            <IcooneMediaGallery />
          </section>

          <section>
            <h3 className="mb-4 text-3xl text-[#1f1a15]">What is Icoone?</h3>
            <p className="rounded-2xl border border-[#b78d4b2d] bg-white p-6 text-[#5f5344]">
              Icoone therapy employs a system of rollers and suction to create a unique massage technique that stimulates the skin and deeper
              tissues. The treatment is designed to improve circulation, enhance lymphatic drainage, and promote overall skin health.
            </p>
          </section>

          <section>
            <h3 className="mb-5 text-3xl text-[#1f1a15]">How Icoone Works</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <PremiumCard
                title="Micro-Stimulation"
                description="The device uses mechanical rollers and suction to perform a gentle massage that mimics natural lymphatic movement."
              />
              <PremiumCard
                title="Personalization"
                description="Treatments can be tailored to areas like abdomen, thighs, arms, or face for focused contouring and skin tightening."
              />
            </div>
          </section>

          <section>
            <h3 className="mb-5 text-3xl text-[#1f1a15]">The Benefits of Icoone</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {benefits.map((item) => (
                <PremiumCard key={item.title} title={item.title} description={item.description} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-5 text-3xl text-[#1f1a15]">How Icoone Reduces Inflammation</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {inflammationSupport.map((item) => (
                <PremiumCard key={item.title} title={item.title} description={item.description} />
              ))}
            </div>
          </section>

          <section>
            <div className="rounded-3xl border border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8 shadow-[0_18px_40px_-30px_rgba(66,45,14,0.45)]">
              <p className="text-[#5f5344]">
                Icoone therapy is a versatile and effective treatment that not only aids in body contouring and skin tightening but also
                plays a significant role in reducing inflammation. Its ability to enhance lymphatic drainage, improve circulation, and promote
                overall skin health makes it a valuable addition to a comprehensive wellness program.
              </p>
              <p className="mt-3 text-[#5f5344]">
                As with any treatment, it&apos;s advisable to consult with a healthcare professional to determine if Icoone is suitable for your
                specific needs and health goals.
              </p>
              <Link href="/contact" className="mt-6 inline-flex rounded-full bg-[#b78d4b] px-6 py-3 text-white">
                LEARN MORE
              </Link>
            </div>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}
