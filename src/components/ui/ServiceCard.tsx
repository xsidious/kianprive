import Image from "next/image";
import Link from "next/link";

export function ServiceCard({
  title,
  description,
  image,
  href = "/book-online",
  ctaLabel = "Book Now",
}: {
  title: string;
  description: string;
  image?: string;
  href?: string;
  ctaLabel?: string;
}) {
  const imageClassName =
    title === "Nutrition Services" ? "object-cover object-top" : "object-cover";

  return (
    <article className="rounded-sm border border-[#e4d9c8] bg-[#fffcf7] p-6">
      {image ? (
        <div className="relative mb-5 h-48 overflow-hidden rounded-sm">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            quality={70}
            className={imageClassName}
          />
        </div>
      ) : null}
      <h3 className="font-serif text-xl text-[#2b2218]">{title}</h3>
      <p className="mt-3 text-sm text-[#6b5f4f]">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-sm bg-[#8a682e] px-4 py-2 text-[11px] tracking-[0.16em] text-white transition hover:bg-[#755724]"
      >
        {ctaLabel.toUpperCase()}
      </Link>
    </article>
  );
}
