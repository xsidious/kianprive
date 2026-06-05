import Image from "next/image";
import Link from "next/link";

export function ServiceCard({
  title,
  description,
  image,
  href = "/book-online",
}: {
  title: string;
  description: string;
  image?: string;
  href?: string;
}) {
  const imageClassName =
    title === "Nutrition Services" ? "object-cover object-top" : "object-cover";

  return (
    <article className="rounded-3xl border border-[#b78d4b2e] bg-white p-7 shadow-[0_14px_35px_-25px_rgba(66,45,14,0.35)]">
      {image ? (
        <div className="relative mb-5 h-48 overflow-hidden rounded-2xl">
          <Image src={image} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className={imageClassName} />
        </div>
      ) : null}
      <h3 className="text-xl text-[#2b2218]">{title}</h3>
      <p className="mt-3 text-[#6b5f4f]">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-full bg-[#b78d4b] px-4 py-2 text-sm text-white transition hover:brightness-95"
      >
        Book Now
      </Link>
    </article>
  );
}
