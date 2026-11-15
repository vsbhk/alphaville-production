"use client";

import { FormEvent, useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";
import { projectSponsors } from "@/lib/sponsors";

type FollowUpStatus = "To request" | "Chaser sent" | "Awaiting reply" | "Received";
type FollowUp = { id: string; owner: string; missing: string; status: FollowUpStatus };

const STORAGE_KEY = "hkdw-2027-information-followups-v1";
const statuses: FollowUpStatus[] = ["To request", "Chaser sent", "Awaiting reply", "Received"];
const initialFollowUps: FollowUp[] = [
  { id: "xpeng-interview-info", owner: "XPENG", missing: "Confirm the time and agreed meeting point for Jerry Tam’s interview on 22 November. The vehicle display location is a preference, not a confirmed meeting point.", status: "To request" },
  { id: "world-press-conference-confirmations", owner: "Event organiser", missing: "Confirm the Dragon Association welcome speaker, final press-conference sponsor and attendee list, group-photo headcount, and final media call. The latest rundown is marked tentative; the press conference overlaps the official 18:00–19:00 skippers’ briefing.", status: "To request" },
  { id: "shk-logos-brand", owner: "Sun Hung Kai & Co.", missing: "Upload both logo files and provide brand guidelines.", status: "To request" },
  { id: "shk-media-access", owner: "Sun Hung Kai & Co.", missing: "Provide access to the cleared photos and video footage. For large files, provide a transfer link, access instructions and expiry date.", status: "To request" },
  { id: "shk-filming-details", owner: "Sun Hung Kai & Co.", missing: "Confirm the proposed filming slot, then provide interview duration, a day-of/PA contact, and bad-weather and absence alternatives.", status: "To request" },
  { id: "shk-approval-details", owner: "Sun Hung Kai & Co.", missing: "Confirm approval turnaround, caption languages, name spellings and usage restrictions. The source record says a follow-up was sent on 13 November 2026.", status: "Chaser sent" },
];

function chaserDraft(item: FollowUp) {
  return `Subject: HKDW 2027 production follow-up\n\nHello ${item.owner},\n\nWe’re preparing the production materials for the Hong Kong Dragon Championship. Could you please provide or confirm the following?\n\n${item.missing}\n\nPlease let us know if anything is not available yet.\n\nMany thanks`;
}

function sponsorHref(owner: string, id: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/[^a-z0-9]/g, "");
  const sponsor = projectSponsors.find((candidate) => normalize(candidate.name) === normalize(owner));
  return sponsor ? `/p/hkdw-2027/sponsors/${sponsor.slug}?followup=${encodeURIComponent(id)}#missing-information` : null;
}

export function InformationFollowUpTracker({ editable }: { editable: boolean }) {
  const [items, setItems] = useState<FollowUp[]>(initialFollowUps);
  const [ready, setReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [newMissing, setNewMissing] = useState("");
  const [message, setMessage] = useState("Loading follow-ups…");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const shared = await loadWorkspaceData<FollowUp[]>("information-followups");
        if (cancelled) return;
        if (Array.isArray(shared)) setItems(shared);
        else {
          try {
            const local = window.localStorage.getItem(STORAGE_KEY);
            if (local) setItems(JSON.parse(local) as FollowUp[]);
          } catch { /* Keep the source-backed starter list if the browser copy cannot be read. */ }
        }
        setCloudReady(true);
        setMessage(shared ? "Information follow-ups loaded." : "Review who owes each item, then update its status.");
      } catch {
        if (cancelled) return;
        try {
          const local = window.localStorage.getItem(STORAGE_KEY);
          if (local) setItems(JSON.parse(local) as FollowUp[]);
        } catch { /* Keep the source-backed starter list if the browser copy cannot be read. */ }
        setMessage("Cloud storage is unavailable. Follow-up changes stay in this browser.");
      }
      if (!cancelled) setReady(true);
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !editable) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* Keep edits in memory. */ }
    if (!cloudReady) return;
    const timeout = window.setTimeout(() => {
      void saveWorkspaceData("information-followups", items)
        .then(() => setMessage("Information follow-ups saved to your private workspace."))
        .catch(() => {
          setCloudReady(false);
          setMessage("Cloud storage is unavailable. Follow-up changes stay in this browser.");
        });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [items, ready, editable, cloudReady]);

  function addFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const owner = newOwner.trim();
    const missing = newMissing.trim();
    if (!owner || !missing) return;
    setItems((current) => [...current, { id: globalThis.crypto.randomUUID(), owner, missing, status: "To request" }]);
    setNewOwner("");
    setNewMissing("");
  }

  async function copyChaser(item: FollowUp) {
    try {
      await navigator.clipboard.writeText(chaserDraft(item));
      setMessage("Chaser draft copied. Review it and send it from your email.");
    } catch {
      setMessage("Clipboard access is unavailable. Open the draft below and copy it manually.");
    }
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] sm:items-start">
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Waiting on
              <input value={item.owner} disabled={!editable || !ready} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, owner: event.target.value } : row))} className="mt-1.5 h-10 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[var(--foreground)] disabled:opacity-70" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Information needed
              <textarea value={item.missing} disabled={!editable || !ready} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, missing: event.target.value } : row))} rows={3} className="mt-1.5 w-full rounded-md border border-[var(--line-strong)] bg-white p-3 text-sm font-normal normal-case leading-5 tracking-normal text-[var(--foreground)] disabled:opacity-70" />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Status
              <select value={item.status} disabled={!editable || !ready} onChange={(event) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, status: event.target.value as FollowUpStatus } : row))} className="mt-1.5 h-10 w-full rounded-md border border-[var(--line-strong)] bg-white px-2 text-sm font-medium normal-case tracking-normal text-[var(--foreground)] disabled:opacity-70">
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void copyChaser(item)} disabled={!ready || !item.owner.trim() || !item.missing.trim()} className="min-h-10 rounded-md border border-[var(--line-strong)] bg-white px-3 text-xs font-semibold disabled:opacity-50">Copy chaser draft</button>
            {sponsorHref(item.owner, item.id) && <a href={sponsorHref(item.owner, item.id)!} className="inline-flex min-h-10 items-center rounded-md border border-[var(--line-strong)] bg-white px-3 text-xs font-semibold text-[var(--accent)] underline underline-offset-4">Open sponsor page · highlight missing info</a>}
            {editable && <button type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} disabled={!ready} className="min-h-10 px-2 text-xs font-semibold text-[var(--muted)] underline underline-offset-4 disabled:opacity-50">Remove</button>}
            <details className="basis-full">
              <summary className="min-h-10 cursor-pointer py-2 text-xs font-semibold text-[var(--accent)] underline underline-offset-4">Preview email text</summary>
              <textarea readOnly value={chaserDraft(item)} rows={8} className="w-full rounded-md border border-[var(--line)] bg-white p-3 text-sm leading-5 text-[var(--foreground)]" aria-label={`Email draft for ${item.owner}`} />
            </details>
          </div>
        </article>
      ))}

      {editable && <form onSubmit={addFollowUp} className="grid gap-3 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_auto] sm:items-end sm:p-5">
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Who owes the information?
          <input value={newOwner} onChange={(event) => setNewOwner(event.target.value)} disabled={!ready} placeholder="Sponsor, provider or contact" className="mt-1.5 h-10 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[var(--foreground)]" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">What is missing?
          <input value={newMissing} onChange={(event) => setNewMissing(event.target.value)} disabled={!ready} placeholder="Information or material needed" className="mt-1.5 h-10 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-sm font-normal normal-case tracking-normal text-[var(--foreground)]" />
        </label>
        <button type="submit" disabled={!ready || !newOwner.trim() || !newMissing.trim()} className="min-h-10 rounded-md bg-[var(--foreground)] px-4 text-xs font-semibold text-white disabled:opacity-50">Add follow-up</button>
      </form>}

      <p role="status" className="text-xs leading-5 text-[var(--muted)]">{editable ? message : "Read-only project view. Follow-up editing is reserved for Alphaville project staff."} Email drafts are copied for you to review and send; the app does not send them.</p>
    </div>
  );
}
