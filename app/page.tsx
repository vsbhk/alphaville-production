import { SignInForm } from "@/components/SignInForm";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";

export default async function Home({ searchParams }: { searchParams: Promise<{ setup?: string; next?: string; error?: string }> }) {
  const params = await searchParams;
  const requestedPath = params.next ?? "/p/hkdw-2027";
  const nextPath = requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/p/hkdw-2027";
  const googleReady = Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AlphavilleHeader />

      <main className="mx-auto grid min-h-[calc(100vh-132px)] max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1fr_400px] md:gap-20 md:py-20">
        <section className="max-w-xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Production workspace
          </p>
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl">
            Your workspace, in one place.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)]">
            Sign in with the owner’s Alphaville Google account to reach your personal workspace.
          </p>

        </section>

        <section className="border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use your Alphaville owner account.</p>
          </div>

          <SignInForm googleReady={googleReady} nextPath={nextPath} authError={params.error === "Configuration" || params.error === "OAuthSignin"} />
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <p className="text-xs text-[var(--muted)]">Alphaville · Personal workspace</p>
        </div>
      </footer>
    </div>
  );
}
