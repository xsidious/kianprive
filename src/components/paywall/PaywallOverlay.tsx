import Link from "next/link";

export function PaywallOverlay({ message = "Unlock Training Access" }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-sm border border-[#c9a86a66] bg-black/70 backdrop-blur-sm">
      <div className="max-w-md px-6 text-center">
        <p className="text-[11px] tracking-[0.28em] text-[#c9a86a]">MEMBER ACCESS</p>
        <h3 className="mt-3 font-serif text-2xl text-[#f2eadb]">{message}</h3>
        <p className="mt-3 text-[#e5dbc7cc]">Premium training is reserved for active members.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center rounded-sm border border-[#d7b67699] px-5 text-[11px] tracking-[0.18em] text-[#e8dec9]"
          >
            LOGIN
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-[44px] items-center rounded-sm bg-[#b78d4b] px-5 text-[11px] tracking-[0.18em] text-white"
          >
            UNLOCK ACCESS
          </Link>
        </div>
      </div>
    </div>
  );
}
