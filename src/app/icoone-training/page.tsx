import Image from "next/image";
import { IcooneMediaGallery } from "@/components/services/IcooneMediaGallery";
import { CinematicHero } from "@/components/ui/CinematicHero";
import {
  EditorialEyebrow,
  EditorialSection,
  EditorialPrimaryLink,
  editorialPanel,
} from "@/components/ui/editorial-primitives";
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

function EditorialCard({ title, description }: { title: string; description: string }) {
  return (
    <article className={`${editorialPanel} p-5`}>
      <h3 className="text-xl text-[#2b2218]">{title}</h3>
      <p className="mt-3 text-[#5f5344]">{description}</p>
    </article>
  );
}

export default function IcooneTrainingPage() {
  return (
    <div className="-mt-[1px]">
      <CinematicHero
        eyebrow="ICOONE"
        lineOne="Icoone® lymphatic"
        lineTwo="drainage."
        lineThree="Advanced body care."
        description="Icoone is a non-invasive treatment that utilizes advanced robotic technology to perform micro-stimulation of the skin and underlying tissues. It is primarily known for body contouring, lymphatic drainage, and skin tightening."
        primaryCta={{ label: "Learn More", href: "/contact" }}
        secondaryCta={{ label: "Book Now", href: "/book-online" }}
        imageSrc={icoonePrimaryImage}
        imageAlt="Icoone lymphatic drainage session"
      />

      <EditorialSection>
        <div className={`grid items-center gap-8 ${editorialPanel} p-8 lg:grid-cols-[1.05fr_0.95fr]`}>
          <div>
            <EditorialEyebrow>THERAPY</EditorialEyebrow>
            <h2 className="mt-4 font-serif text-3xl text-[#1f1a15] md:text-4xl">
              Icoone Therapy – FDA Approved for Wellness and Aesthetic Care
            </h2>
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
          <div className="relative h-[320px] overflow-hidden rounded-sm border border-[#e4d9c8]">
            <Image src={getIcooneImage(3).src} alt={getIcooneImage(3).alt} fill className="object-cover" />
          </div>
        </div>
      </EditorialSection>

      <EditorialSection>
        <IcooneMediaGallery />
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>OVERVIEW</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15]">What is Icoone?</h2>
        <p className={`mt-4 ${editorialPanel} p-6 text-[#5f5344]`}>
          Icoone therapy employs a system of rollers and suction to create a unique massage technique that stimulates the skin and deeper
          tissues. The treatment is designed to improve circulation, enhance lymphatic drainage, and promote overall skin health.
        </p>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>HOW IT WORKS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15]">How Icoone Works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <EditorialCard
            title="Micro-Stimulation"
            description="The device uses mechanical rollers and suction to perform a gentle massage that mimics natural lymphatic movement."
          />
          <EditorialCard
            title="Personalization"
            description="Treatments can be tailored to areas like abdomen, thighs, arms, or face for focused contouring and skin tightening."
          />
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>BENEFITS</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15]">The Benefits of Icoone</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <EditorialCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <EditorialEyebrow>INFLAMMATION</EditorialEyebrow>
        <h2 className="mt-4 font-serif text-3xl text-[#1f1a15]">How Icoone Reduces Inflammation</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {inflammationSupport.map((item) => (
            <EditorialCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </EditorialSection>

      <EditorialSection>
        <div className={`${editorialPanel} border-[#b78d4b4f] bg-gradient-to-b from-[#fff8ed] to-[#f1e7d7] p-8`}>
          <p className="text-[#5f5344]">
            Icoone therapy is a versatile and effective treatment that not only aids in body contouring and skin tightening but also
            plays a significant role in reducing inflammation. Its ability to enhance lymphatic drainage, improve circulation, and promote
            overall skin health makes it a valuable addition to a comprehensive wellness program.
          </p>
          <p className="mt-3 text-[#5f5344]">
            As with any treatment, it&apos;s advisable to consult with a healthcare professional to determine if Icoone is suitable for your
            specific needs and health goals.
          </p>
          <EditorialPrimaryLink href="/contact" className="mt-6">
            Learn More
          </EditorialPrimaryLink>
        </div>
      </EditorialSection>
    </div>
  );
}
