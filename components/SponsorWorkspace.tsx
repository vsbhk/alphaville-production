"use client";

import { FormEvent, useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";

type SponsorAsset = {
  id: string;
  title: string;
  category: string;
  driveUrl: string;
  note: string;
  approved: boolean;
};

type SponsorRecord = { assets: SponsorAsset[] };

const blankRecord: SponsorRecord = { assets: [] };

export function SponsorWorkspace({ sponsorSlug, editable }: { sponsorSlug: string; editable: boolean }) {
  const key = `sponsor:${sponsorSlug}`;
  const [record, setRecord] = useState<SponsorRecord>(blankRecord);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading sponsor records…");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logos");
  const [driveUrl, setDriveUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadWorkspaceData<SponsorRecord>(key).then((shared) => {
      if (cancelled) return;
      setRecord(shared && Array.isArray(shared.assets) ? shared : blankRecord);
      setMessage(shared ? "Shared sponsor records loaded." : "No sponsor records have been added yet.");
      setReady(true);
    }).catch(() => {
      if (cancelled) return;
      setMessage("Shared Google Workspace storage is not configured. Sponsor records cannot be loaded or saved yet.");
      setReady(true);
    });
    return () => { cancelled = true; };
  }, [key]);

  async function save(next: SponsorRecord, successMessage: string) {
    setSaving(true);
    setError("");
    try {
      await saveWorkspaceData(key, next);
      setRecord(next);
      setMessage(successMessage);
    } catch {
      setError("Could not save to shared storage. Check the Google Sheet setup and try again.");
      setMessage("Sponsor record was not saved.");
    } finally {
      setSaving(false);
    }
  }

  async function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = driveUrl.trim();
    if (!cleanTitle) { setError("Add a name for this material."); return; }
    if (cleanUrl) {
      try {
        const parsedUrl = new URL(cleanUrl);
        const allowedHosts = new Set(["drive.google.com", "docs.google.com"]);
        if (parsedUrl.protocol !== "https:" || !allowedHosts.has(parsedUrl.hostname)) throw new Error("Not a Drive link");
      } catch {
        setError("Use a valid Google Drive link, or leave the link field blank.");
        return;
      }
    }
    const asset: SponsorAsset = {
      id: globalThis.crypto.randomUUID(),
      title: cleanTitle,
      category,
      driveUrl: cleanUrl,
      note: note.trim(),
      approved: false,
    };
    await save({ assets: [...record.assets, asset] }, "Material added to the shared sponsor record.");
    setTitle("");
    setDriveUrl("");
    setNote("");
  }

  function setApproval(id: string, approved: boolean) {
    const assets = record.assets.map((asset) => asset.id === id ? { ...asset, approved } : asset);
    void save({ assets }, approved ? "Material marked approved." : "Material returned to awaiting review.");
  }

  return (
    <div className="mt-8 space-y-5">
      <p role="status" className="rounded-md bg-amber-50 p-3 text-sm leading-5 text-amber-950">{message}</p>
      {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-900">{error}</p>}

      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="submission-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Submission</p>
            <h2 id="submission-title" className="mt-2 text-xl font-semibold tracking-[-0.03em]">Sponsor materials</h2>
          </div>
          <span className="rounded-full border border-[var(--line-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">{record.assets.length} item{record.assets.length === 1 ? "" : "s"}</span>
        </div>

        {record.assets.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">No sponsor materials are recorded yet.</p>
        ) : (
          <ul className="mt-5 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)]">
            {record.assets.map((asset) => (
              <li key={asset.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                <div className="min-w-0">
                  <p className="font-semibold">{asset.title}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--muted)]">{asset.category} · {asset.approved ? "Approved" : "Awaiting review"}</p>
                  {asset.note && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asset.note}</p>}
                  {asset.driveUrl && <a className="mt-2 inline-block break-all text-sm font-medium text-[var(--accent)] underline underline-offset-4" href={asset.driveUrl} target="_blank" rel="noreferrer">Open Google Drive material</a>}
                </div>
                {editable && <button type="button" disabled={!ready || saving} onClick={() => setApproval(asset.id, !asset.approved)} className="min-h-10 shrink-0 rounded-md border border-[var(--line-strong)] px-3 text-sm font-semibold disabled:opacity-50">{asset.approved ? "Return to review" : "Mark approved"}</button>}
              </li>
            ))}
          </ul>
        )}

        {editable && <form onSubmit={addAsset} className="mt-6 border-t border-[var(--line)] pt-5">
          <h3 className="text-sm font-semibold">Add material or a Drive link</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Add a Google Drive link for your own reference. No sponsor folders are connected or shared by this personal workspace.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Material name
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3">
                <option>Logos</option><option>Brand guidelines</option><option>Text and Word documents</option><option>People and photos</option><option>Other</option>
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">Google Drive link
              <input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://drive.google.com/..." className="mt-2 h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-md border border-[var(--line-strong)] bg-white p-3" />
            </label>
          </div>
          <button type="submit" disabled={!ready || saving} className="mt-4 min-h-11 rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Add to sponsor record"}</button>
        </form>}
      </section>

      <p className="text-xs leading-5 text-[var(--muted)]">Only approved project editors can change sponsor records. Sponsor viewers can read records for their assigned organisation only.</p>
    </div>
  );
}
