import Image from "next/image";
import Link from "next/link";

export function AlphavilleLogo({ onDark = false, size = "header" }: { onDark?: boolean; size?: "header" | "disk" }) {
  if (size === "header") {
    return (
      <Image
        src="/alphaville-wordmark.svg"
        width="624"
        height="242"
        alt="Alphaville"
        className="block h-auto max-w-full shrink-0"
        style={{ width: "clamp(150px, 16vw, 190px)", filter: onDark ? "brightness(0) invert(1)" : undefined }}
      />
    );
  }
  return (
    <Image
      src="/alphaville-logo-lockup.svg"
      width="624"
      height="245"
      alt="Alphaville — Creative Management and Production Services"
      className="block h-auto max-w-full shrink-0"
      style={{
        width: "min(80%, 280px)",
        filter: onDark ? "brightness(0) invert(1)" : undefined,
      }}
    />
  );
}

export function AlphavilleHeader({ label }: { label?: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--background)]">
      <div className="mx-auto flex min-h-[92px] max-w-6xl items-center justify-between gap-4 px-7 py-5 sm:px-12">
        <Link href="/" aria-label="Alphaville workspace sign in" className="inline-flex min-h-12 items-center">
          <AlphavilleLogo />
        </Link>
        {label && <p className="text-right text-xs font-medium tracking-[0.04em] text-[var(--muted)]">{label}</p>}
      </div>
    </header>
  );
}
