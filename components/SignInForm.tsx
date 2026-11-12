"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function SignInForm({ googleReady, nextPath, authError }: { googleReady: boolean; nextPath: string; authError: boolean }) {
  const [notice, setNotice] = useState(authError ? "Sign-in did not complete. Try the personal workspace owner’s Alphaville account." : "");

  async function beginSignIn() {
    try {
      await signIn("google", { callbackUrl: nextPath });
    } catch {
      setNotice("Google sign-in could not start. Check the connection and try again.");
    }
  }

  return <div className="space-y-5">
    {googleReady ? <button type="button" onClick={() => void beginSignIn()} className="h-12 w-full rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white">Continue with your Google account</button> : <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm leading-5 text-amber-950">Google sign-in is not configured in this environment.</p>}
    <p role="status" aria-live="polite" className="min-h-5 text-sm leading-5 text-[var(--muted)]">{notice}</p>
  </div>;
}
