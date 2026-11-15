"use client";

import { useEffect, useMemo, useState } from "react";
import { loadWorkspaceData } from "@/lib/workspace-sync";
import { mergeFollowUps, type FollowUp } from "@/lib/information-followups";

const STORAGE_KEY = "hkdw-2027-information-followups-v1";

function sameSponsor(owner: string, sponsorName: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/[^a-z0-9]/g, "");
  return normalize(owner) === normalize(sponsorName);
}

export function SponsorMissingInformation({ sponsorSlug, sponsorName }: { sponsorSlug: string; sponsorName: string }) {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [highlightId, setHighlightId] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading missing information…");
  const [copied, setCopied] = useState(false);
  const outstanding = useMemo(() => items.filter((item) => (item.sponsorSlug === sponsorSlug || sameSponsor(item.owner, sponsorName)) && item.status !== "Received"), [items, sponsorSlug, sponsorName]);
  const sponsorOwned = useMemo(() => outstanding.filter((item) => sameSponsor(item.owner, sponsorName)), [outstanding, sponsorName]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const shared = await loadWorkspaceData<FollowUp[]>("information-followups");
        if (!cancelled) setHighlightId(new URLSearchParams(window.location.search).get("followup") ?? "");
        if (!cancelled && Array.isArray(shared)) setItems(mergeFollowUps(shared));
        else if (!cancelled) {
          const local = window.localStorage.getItem(STORAGE_KEY);
          if (local) setItems(mergeFollowUps(JSON.parse(local) as FollowUp[]));
        }
        if (!cancelled) setMessage("");
      } catch {
        if (!cancelled) {
          try {
            const local = window.localStorage.getItem(STORAGE_KEY);
            if (local) setItems(mergeFollowUps(JSON.parse(local) as FollowUp[]));
          } catch { /* Keep the page usable when local data is unavailable. */ }
          setMessage("Shared follow-ups could not be loaded. Return to the overview to retry.");
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  async function copyWishList() {
    const lines = sponsorOwned.map((item) => `• ${item.missing}`);
    const text = `Subject: HKDW 2027 information needed\n\nHello ${sponsorName} team,\n\nTo prepare the championship materials, could you please provide or confirm:\n\n${lines.join("\n\n")}\n\nPlease let me know if anything is not available yet.\n\nMany thanks`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage("Clipboard access is unavailable. Select and copy the draft below.");
    }
  }

  return (
    <section id="missing-information" className="mt-8 scroll-mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5" aria-labelledby="missing-information-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Sponsor follow-up</p>
          <h2 id="missing-information-title" className="mt-2 text-xl font-semibold tracking-[-0.03em]">Missing information</h2>
        </div>
        {ready && sponsorOwned.length > 0 && <button type="button" onClick={() => void copyWishList()} className="min-h-11 rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white">{copied ? "Wish list copied" : "Copy sponsor wish list"}</button>}
      </div>
      {message && <p role="status" className="mt-3 text-sm leading-6 text-[var(--muted)]">{message}</p>}
      {ready && outstanding.length === 0 && <p className="mt-3 text-sm leading-6 text-[var(--muted)]">No outstanding follow-ups are listed for this sponsor. Add one from the overview’s “Who owes what” section.</p>}
      {outstanding.length > 0 && <ul className="mt-4 space-y-2">
        {outstanding.map((item) => <li key={item.id} id={`missing-${item.id}`} className={`rounded-md border p-3 text-sm leading-6 ${item.id === highlightId ? "border-[var(--accent)] bg-[var(--background)] ring-2 ring-[var(--accent)]/20" : "border-[var(--line)]"}`}>
          <span className="mr-2 inline-block rounded-full border border-[var(--line-strong)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted)]">Waiting on {item.owner} · {item.status}</span>{item.missing}
        </li>)}
      </ul>}
      {sponsorOwned.length > 0 && <details className="mt-3">
        <summary className="min-h-10 cursor-pointer py-2 text-sm font-semibold text-[var(--accent)] underline underline-offset-4">Preview copy-and-paste email</summary>
        <textarea readOnly rows={Math.min(14, 7 + sponsorOwned.length * 2)} value={`Subject: HKDW 2027 information needed\n\nHello ${sponsorName} team,\n\nTo prepare the championship materials, could you please provide or confirm:\n\n${sponsorOwned.map((item) => `• ${item.missing}`).join("\n\n")}\n\nPlease let me know if anything is not available yet.\n\nMany thanks`} className="mt-2 w-full rounded-md border border-[var(--line)] bg-white p-3 text-sm leading-5" aria-label={`Copy-and-paste email to ${sponsorName}`} />
      </details>}
      <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Only items not marked Received are included. Review the draft and send it yourself.</p>
    </section>
  );
}
