"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function SignInForm({ setupRequired }: { setupRequired: boolean }) {
  const [notice, setNotice] = useState(setupRequired ? "Google sign-in setup is incomplete. Contact the workspace administrator." : "");
  const [busy, setBusy] = useState(false);

  async function passwordSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false });
    setBusy(false);
    if (result?.error) setNotice("We couldn’t sign you in. Check your email and password or contact the workspace administrator.");
    else window.location.assign("/p/hkdw-2027");
  }

  return <div className="space-y-5">
    <button type="button" disabled={setupRequired || busy} onClick={() => signIn("google", { callbackUrl: "/p/hkdw-2027" })} className="h-12 w-full rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">Continue with Alphaville Google account</button>
    <div className="border-t border-[var(--line)] pt-4">
      <p className="mb-3 text-sm font-medium">External project access</p>
      <form onSubmit={passwordSignIn} className="space-y-3">
        <label className="sr-only" htmlFor="external-email">Email address</label>
        <input id="external-email" name="email" type="email" autoComplete="username" required placeholder="Your approved email" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base" />
        <label className="sr-only" htmlFor="external-password">Password</label>
        <input id="external-password" name="password" type="password" autoComplete="current-password" required placeholder="Password" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base" />
        <button disabled={busy} type="submit" className="h-11 w-full rounded-md border border-[var(--line-strong)] px-4 text-sm font-semibold disabled:opacity-50">{busy ? "Signing in…" : "Sign in with password"}</button>
      </form>
    </div>
    <p role="status" aria-live="polite" className="min-h-5 text-sm leading-5 text-[var(--muted)]">{notice}</p>
  </div>;
}
