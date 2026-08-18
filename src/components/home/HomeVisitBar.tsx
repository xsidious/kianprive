import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { editorialCtaPrimary, editorialPanel } from "@/components/ui/editorial-primitives";

const contacts = [
  {
    icon: Phone,
    label: "Call concierge",
    value: "305-918-2570",
    href: "tel:3059182570",
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@kianprive.com",
    href: "mailto:contact@kianprive.com",
  },
  {
    icon: MapPin,
    label: "Visit",
    value: "North Miami Beach, FL",
    href: "/contact",
  },
];

export function HomeVisitBar() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="grid gap-3 sm:grid-cols-3">
        {contacts.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`${editorialPanel} flex items-center gap-3 p-4 transition hover:border-[#b78d4b80] hover:bg-white`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#fff3df] text-[#8f6f3e]">
              <item.icon size={18} aria-hidden />
            </span>
            <span>
              <span className="block text-[10px] tracking-[0.16em] text-[#8f6f3e]">{item.label.toUpperCase()}</span>
              <span className="mt-0.5 block text-sm text-[#1f1a15]">{item.value}</span>
            </span>
          </a>
        ))}
      </div>
      <Link href="/book-online" className={`${editorialCtaPrimary} justify-self-start lg:justify-self-end`}>
        BOOK ONLINE
      </Link>
    </div>
  );
}
