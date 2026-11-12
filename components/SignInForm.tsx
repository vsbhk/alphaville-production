"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function SignInForm({ setupRequired }: { setupRequired: boolean }) {
  const [notice, setNotice] = useState(setupRequired ? "Workspace setup is incomplete. Add the Supabase URL and publishable key to enable sign-in." : "");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const supabase = createClient();
    if (!supabase) { setNotice("Sign-in is not configured yet. Contact the workspace administrator."); return; }
    setBusy(true);
    setNotice("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setBusy(false);
    setNotice(error ? "We couldn’t send a sign-in link. Check the address and try again." : "If this email is approved, a sign-in link will arrive shortly.");
  }

  return <form onSubmit={submit} className="space-y-4">
    <label htmlFor="email" className="block text-sm font-medium">Email address</label>
    <input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" className="h-12 w-full rounded-md border border-[var(--line-strong)] bg-[var(--background)] px-3.5 text-base outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
    <button disabled={busy || setupRequired} type="submit" className="h-12 w-full rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-50">{busy ? "Sending link…" : "Email me a sign-in link"}</button>
    <p aria-live="polite" className="min-h-5 text-sm leading-5 text-[var(--muted)]">{notice}</p>
  </form>;
}
