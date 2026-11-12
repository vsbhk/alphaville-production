import { SignInForm } from "@/components/SignInForm";

export default async function Home({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="text-[17px] font-semibold tracking-[-0.04em]" aria-label="Alphaville home">
            Alphaville<span className="ml-1 text-[var(--accent)]">.</span>
          </a>
          <span className="text-xs font-medium text-[var(--muted)]">Private workspace</span>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-132px)] max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1fr_400px] md:gap-20 md:py-20">
        <section className="max-w-xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Production workspace
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl">
            Your project, in one place.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)]">
            Sign in with your approved email to reach your project materials.
          </p>

          <div className="mt-12 border-l-2 border-[var(--accent)] pl-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Project</p>
            <p className="mt-2 text-base font-medium tracking-[-0.02em]">HKDW 2027 - Royal Hong Kong Yacht Club</p>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_55px_rgba(26,35,31,0.06)] sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-medium text-[var(--muted)]">HKDW 2027 - Royal Hong Kong Yacht Club</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use the email address approved for this project.</p>
          </div>

          <SignInForm setupRequired={params.setup === "required"} />
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <p className="text-xs text-[var(--muted)]">prod.alphaville.hk · Push check</p>
        </div>
      </footer>
    </div>
  );
}
