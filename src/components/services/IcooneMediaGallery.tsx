import Image from "next/image";
import { icooneMediaGallery, type IcooneMediaItem } from "@/lib/media/icoone";
import type { ServiceMediaItem } from "@/lib/services/types";

type IcooneMediaGalleryProps = {
  title?: string;
  items?: Array<IcooneMediaItem | ServiceMediaItem>;
  className?: string;
};

export function IcooneMediaGallery({
  title = "Icoone® in Practice",
  items = icooneMediaGallery,
  className = "",
}: IcooneMediaGalleryProps) {
  return (
    <section className={className}>
      {title ? <h2 className="text-2xl text-[#1f1a15] sm:text-3xl md:text-4xl">{title}</h2> : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <figure
            key={item.src}
            className="overflow-hidden rounded-2xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]"
          >
            <div className="relative aspect-[4/3]">
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
            {item.caption ? <figcaption className="px-4 py-3 text-sm text-[#5f5344]">{item.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
