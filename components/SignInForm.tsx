"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function SignInForm({ googleReady, nextPath, authError, onDark = false }: { googleReady: boolean; nextPath: string; authError: boolean; onDark?: boolean }) {
  const [notice, setNotice] = useState(authError ? "Sign-in did not complete. Try the Alphaville owner account." : "");

  async function beginSignIn() {
    try {
      await signIn("google", { callbackUrl: nextPath });
    } catch {
      setNotice("Google sign-in could not start. Check the connection and try again.");
    }
  }

  return <div className="w-full space-y-4">
    <button
      type="button"
      onClick={() => void beginSignIn()}
      disabled={!googleReady}
      className={`min-h-12 w-full rounded-md border px-4 py-3 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 ${onDark ? "border-white bg-white text-[#171717] focus-visible:outline-white" : "border-[var(--foreground)] bg-[var(--foreground)] text-white focus-visible:outline-[var(--foreground)]"}`}
    >
      Continue with Google
    </button>
    {notice && <p role="status" aria-live="polite" className={`text-center text-xs leading-4 ${onDark ? "text-white/75" : "text-[var(--muted)]"}`}>{notice}</p>}
  </div>;
}
