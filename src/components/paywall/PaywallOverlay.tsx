import Link from "next/link";

export function PaywallOverlay({ message = "Unlock Training Access" }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-[#d7b67666] bg-black/70 backdrop-blur-sm">
      <div className="max-w-md text-center">
        <h3 className="text-2xl text-[#f2eadb]">{message}</h3>
        <p className="mt-3 text-[#e5dbc7cc]">Premium training is reserved for active members.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="rounded-full border border-[#d7b67699] px-5 py-2 text-[#e8dec9]">
            Login
          </Link>
          <Link href="/pricing" className="rounded-full bg-[#d7b676] px-5 py-2 text-black">
            Unlock Access
          </Link>
        </div>
      </div>
    </div>
  );
}
