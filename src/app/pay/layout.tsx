export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf6ef]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(183,141,75,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(143,111,62,0.12), transparent), radial-gradient(ellipse 50% 35% at 0% 80%, rgba(183,141,75,0.08), transparent)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
