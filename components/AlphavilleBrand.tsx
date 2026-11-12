import Image from "next/image";

export function AlphavilleLogo() {
  return (
    <Image
      src="/alphaville-logo-lockup.svg"
      width="624"
      height="245"
      alt="Alphaville — Creative Management and Production Services"
      className="h-auto w-[112px] sm:w-[126px]"
    />
  );
}

export function AlphavilleHeader({ label = "Personal workspace" }: { label?: string }) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="/" aria-label="Alphaville workspace sign in" className="inline-flex min-h-11 items-center">
          <AlphavilleLogo />
        </a>
        <p className="text-right text-xs font-medium tracking-[0.04em] text-[var(--muted)]">{label}</p>
      </div>
    </header>
  );
}
