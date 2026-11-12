import Image from "next/image";

export function AlphavilleLogo({ onDark = false, size = "header" }: { onDark?: boolean; size?: "header" | "disk" }) {
  return (
    <Image
      src="/alphaville-logo-lockup.svg"
      width="624"
      height="245"
      alt="Alphaville — Creative Management and Production Services"
      className="block h-auto max-w-full shrink-0"
      style={{
        width: size === "disk" ? "min(80%, 280px)" : "clamp(112px, 14vw, 156px)",
        filter: onDark ? "brightness(0) invert(1)" : undefined,
      }}
    />
  );
}

export function AlphavilleHeader({ label }: { label?: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="/" aria-label="Alphaville workspace sign in" className="inline-flex min-h-11 items-center">
          <AlphavilleLogo />
        </a>
        {label && <p className="text-right text-xs font-medium tracking-[0.04em] text-[var(--muted)]">{label}</p>}
      </div>
    </header>
  );
}
