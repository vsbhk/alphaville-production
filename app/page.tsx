"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Email sign-in is not connected in this preview.");
  }

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="email" className="block text-sm font-medium">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              className="h-12 w-full rounded-md border border-[var(--line-strong)] bg-[var(--background)] px-3.5 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10"
            />
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Continue
            </button>
            <p aria-live="polite" className="min-h-5 text-sm leading-5 text-[var(--muted)]">
              {notice}
            </p>
          </form>
        </section>
      </main>

      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p>
        </div>
      </footer>
    </div>
  );
}
