import { SignInForm } from "@/components/SignInForm";
import { AlphavilleLogo } from "@/components/AlphavilleBrand";

export default async function Home({ searchParams }: { searchParams: Promise<{ setup?: string; next?: string; error?: string }> }) {
  const params = await searchParams;
  const requestedPath = params.next ?? "/p/hkdw-2027";
  const nextPath = requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/p/hkdw-2027";
  const googleReady = Boolean(process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <main
        className="grid h-[100dvh] w-full place-items-center overflow-hidden px-3"
        style={{ height: "100dvh", display: "grid", placeItems: "center" }}
        aria-label="Alphaville owner sign-in"
      >
        <section
          className="flex shrink-0 flex-col items-center justify-center rounded-full bg-black px-[12%] text-center text-white shadow-[0_14px_42px_rgba(0,0,0,0.14)]"
          style={{
            width: "min(88vw, 580px, calc(100dvh - 32px))",
            height: "min(88vw, 580px, calc(100dvh - 32px))",
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100dvh - 32px)",
          }}
        >
          <AlphavilleLogo onDark size="disk" />
          <div className="my-3 h-px w-9 bg-white/35 sm:my-5" aria-hidden="true" />
          <h1 className="sr-only">Alphaville owner sign-in</h1>
          <div
            className="mt-4 w-full sm:mt-5"
            style={{ width: "min(100%, 20rem)", maxWidth: "20rem", boxSizing: "border-box" }}
          >
            <SignInForm googleReady={googleReady} nextPath={nextPath} authError={params.error === "Configuration" || params.error === "OAuthSignin"} onDark />
          </div>
        </section>
      </main>
    </div>
  );
}
