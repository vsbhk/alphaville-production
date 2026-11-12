"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";
import { createSponsorArchive, type SponsorDetails } from "@/lib/sponsor-archive";
import { deleteSponsorFile, loadLocalSponsorRecord, loadSponsorFile, saveLocalSponsorRecord, saveSponsorFile, type StoredSponsorFile } from "@/lib/sponsor-file-store";

type SponsorAsset = {
  id: string;
  title: string;
  category: string;
  driveUrl: string;
  note: string;
  approved?: boolean;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
};

type SponsorRecord = { details?: SponsorDetails; assets: SponsorAsset[]; updatedAt?: number };
type StorageMode = "cloud" | "local";

const emptyDetails: SponsorDetails = {
  brandName: "",
  contactName: "",
  contactPhone: "",
  website: "",
  brief: "",
  notes: "",
};
const blankRecord: SponsorRecord = { details: emptyDetails, assets: [] };
const categories = ["Logos", "Brand guidelines", "Text and Word documents", "People and photos", "Video and audio", "Other"];

function normalizeRecord(saved: SponsorRecord | null): SponsorRecord {
  return saved && Array.isArray(saved.assets)
    ? { ...blankRecord, ...saved, details: { ...emptyDetails, ...saved.details } }
    : blankRecord;
}

export function SponsorWorkspace({ sponsorSlug, sponsorName, editable }: { sponsorSlug: string; sponsorName: string; editable: boolean }) {
  const key = `sponsor:${sponsorSlug}`;
  const [record, setRecord] = useState<SponsorRecord>(blankRecord);
  const [details, setDetails] = useState<SponsorDetails>(emptyDetails);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>("cloud");
  const [message, setMessage] = useState("Loading sponsor collection…");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logos");
  const [driveUrl, setDriveUrl] = useState("");
  const [note, setNote] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadCollection = useCallback(async () => {
    setReady(false);
    setMessage("Checking your saved sponsor collection…");
    let cloudRecord: SponsorRecord | null = null;
    let cloudFailed = false;
    let localRecord: SponsorRecord | null = null;
    let localFailed = false;
    try { cloudRecord = await loadWorkspaceData<SponsorRecord>(key); }
    catch { cloudFailed = true; }
    try { localRecord = await loadLocalSponsorRecord<SponsorRecord>(key); }
    catch { localFailed = true; }

    if (cloudFailed && localFailed) {
      setMessage("Saved information is unavailable in Google Sheets and this browser. Retry before editing so an existing collection is not replaced.");
      return;
    }

    const remote = normalizeRecord(cloudRecord);
    const local = normalizeRecord(localRecord);
    if (cloudFailed) {
      const fallback = localRecord ? local : blankRecord;
      setRecord(fallback);
      setDetails(fallback.details ?? emptyDetails);
      setStorageMode("local");
      setMessage(localRecord
        ? "Google Sheets is unavailable. You’re using this browser’s saved draft; changes stay here until you sync."
        : "Google Sheets is unavailable. You can start a browser-only draft and download its ZIP; it won’t replace the cloud record.");
      setReady(true);
      return;
    }

    if (localRecord && (local.updatedAt ?? 0) > (remote.updatedAt ?? 0)) {
      setRecord(local);
      setDetails(local.details ?? emptyDetails);
      setStorageMode("local");
      setMessage("A newer browser draft is available. Review it, then sync it to Google Sheets when ready.");
      setReady(true);
      return;
    }

    setRecord(remote);
    setDetails(remote.details ?? emptyDetails);
    setStorageMode("cloud");
    setMessage(cloudRecord ? "Sponsor collection loaded." : "Start this sponsor’s private collection.");
    setReady(true);
    if (cloudRecord) void saveLocalSponsorRecord(key, remote).catch(() => undefined);
  }, [key]);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  async function save(next: SponsorRecord, successMessage: string): Promise<boolean> {
    setSaving(true);
    setError("");
    const updated = { ...next, updatedAt: Date.now() };
    try {
      if (storageMode === "cloud") {
        try {
          await saveWorkspaceData(key, updated);
          await saveLocalSponsorRecord(key, updated).catch(() => undefined);
          setRecord(updated);
          setDetails(updated.details ?? emptyDetails);
          setMessage(successMessage);
          return true;
        } catch {
          // Keep the changed collection on this browser; never discard the user's work.
        }
      }
      await saveLocalSponsorRecord(key, updated);
      setStorageMode("local");
      setRecord(updated);
      setDetails(updated.details ?? emptyDetails);
      setMessage("Saved in this browser only. Sync it to Google Sheets when the connection is available.");
      return true;
    } catch {
      setError("This browser could not save the draft. Keep this page open and download the ZIP before leaving.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function syncLocalDraft() {
    if (!record.updatedAt) return;
    setSaving(true);
    setError("");
    try {
      const existing = await loadWorkspaceData<SponsorRecord>(key);
      if (existing && (existing.updatedAt ?? 0) > (record.updatedAt ?? 0)) {
        setError("Google Sheets has a newer collection. Retry loading it before syncing this older draft.");
        return;
      }
      const confirmed = window.confirm("Save this browser draft to Google Sheets? It will replace the older cloud copy for this sponsor.");
      if (!confirmed) return;
      await saveWorkspaceData(key, record);
      await saveLocalSponsorRecord(key, record).catch(() => undefined);
      setStorageMode("cloud");
      setMessage("Browser draft synced to your private Google Sheet.");
    } catch {
      setError("Google Sheets is still unavailable. Your browser draft is unchanged.");
    } finally {
      setSaving(false);
    }
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save({ ...record, details }, "Sponsor details saved to your private workspace.");
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []));
    setError("");
  }

  async function addMaterials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = driveUrl.trim();
    if (cleanUrl) {
      try {
        const parsed = new URL(cleanUrl);
        if (parsed.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(parsed.hostname)) throw new Error("Invalid Drive link");
      } catch {
        setError("Use a valid Google Drive link, or clear the link field.");
        return;
      }
    }
    if (selectedFiles.length === 0 && (!cleanUrl || !cleanTitle)) {
      setError("Choose at least one file, or provide both a material name and Google Drive link.");
      return;
    }

    const newAssets: SponsorAsset[] = selectedFiles.map((file) => {
      const id = globalThis.crypto.randomUUID();
      return { id, fileId: id, fileName: file.name, fileSize: file.size, title: file.name, category, driveUrl: "", note: note.trim() };
    });
    if (cleanUrl) newAssets.push({ id: globalThis.crypto.randomUUID(), title: cleanTitle, category, driveUrl: cleanUrl, note: note.trim() });

    try {
      for (const [index, file] of selectedFiles.entries()) await saveSponsorFile(file, newAssets[index].id);
    } catch {
      setError("The browser could not store one of these files. Check available storage and try again.");
      return;
    }

    const saved = await save({ ...record, assets: [...record.assets, ...newAssets] }, "Files and references added to this sponsor’s collection.");
    if (!saved) {
      await Promise.all(newAssets.filter((asset) => asset.fileId).map((asset) => deleteSponsorFile(asset.id).catch(() => undefined)));
      return;
    }
    setTitle("");
    setDriveUrl("");
    setNote("");
    setSelectedFiles([]);
    const input = document.getElementById("sponsor-files") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function removeAsset(asset: SponsorAsset) {
    const saved = await save({ ...record, assets: record.assets.filter((item) => item.id !== asset.id) }, "Item removed from this sponsor’s collection.");
    if (saved && asset.fileId) await deleteSponsorFile(asset.fileId).catch(() => undefined);
  }

  async function downloadZip() {
    setExporting(true);
    setError("");
    try {
      const files = new Map<string, StoredSponsorFile>();
      for (const asset of record.assets) {
        if (!asset.fileId) continue;
        const stored = await loadSponsorFile(asset.fileId);
        if (stored) files.set(asset.fileId, stored);
      }
      const archive = await createSponsorArchive({ sponsorName, sponsorSlug, details: record.details ?? emptyDetails, assets: record.assets, files });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sponsorSlug}-hkdw-2027.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("ZIP downloaded. Review it, then share it with Icarus when you’re ready.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the ZIP file. Try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mt-8 min-w-0 space-y-5">
      <div className="min-w-0 border border-[var(--line)] bg-[var(--background)] p-3">
        <p role="status" className="break-words text-sm leading-5 text-[var(--muted)]">{message}</p>
        {storageMode === "local" && ready && <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadCollection()} disabled={saving} className="min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold disabled:opacity-50">Retry cloud connection</button>
          {record.updatedAt && <button type="button" onClick={() => void syncLocalDraft()} disabled={saving} className="min-h-10 bg-[var(--foreground)] px-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Syncing…" : "Sync browser draft"}</button>}
        </div>}
        {!ready && <button type="button" onClick={() => void loadCollection()} className="mt-3 min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold">Retry loading</button>}
      </div>
      {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-900">{error}</p>}

      <section className="min-w-0 border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="submission-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Sponsor collection</p>
            <h2 id="submission-title" className="mt-2 text-xl font-semibold tracking-[-0.03em]">{sponsorName}</h2>
          </div>
          <span className="border border-[var(--line-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">{record.assets.length} item{record.assets.length === 1 ? "" : "s"}</span>
        </div>

        <form onSubmit={saveDetails} className="mt-5 border-t border-[var(--line)] pt-5">
          <h3 className="text-sm font-semibold">Sponsor information</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Keep the working details and requirements together with this sponsor’s materials.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Brand or company name
              <input value={details.brandName} onChange={(event) => setDetails({ ...details, brandName: event.target.value })} placeholder={sponsorName} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Website
              <input value={details.website} onChange={(event) => setDetails({ ...details, website: event.target.value })} placeholder="https://" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Main contact
              <input value={details.contactName} onChange={(event) => setDetails({ ...details, contactName: event.target.value })} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Contact phone
              <input type="tel" value={details.contactPhone} onChange={(event) => setDetails({ ...details, contactPhone: event.target.value })} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Brief and requirements
              <textarea value={details.brief} onChange={(event) => setDetails({ ...details, brief: event.target.value })} rows={4} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Additional notes
              <textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
          </div>
          {editable && <button type="submit" disabled={!ready || saving} className="mt-4 min-h-11 bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save sponsor information"}</button>}
        </form>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Files and references</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Add source files and Drive references for the final handoff.</p>
            </div>
            <button type="button" onClick={downloadZip} disabled={!ready || exporting} className="min-h-11 border border-[var(--foreground)] px-4 text-sm font-semibold disabled:opacity-50">{exporting ? "Preparing ZIP…" : "Download sponsor ZIP"}</button>
          </div>
          {record.assets.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">No files or references have been added yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {record.assets.map((asset) => (
                <li key={asset.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{asset.fileName || asset.title}</p>
                    <p className="mt-1 text-xs font-medium text-[var(--muted)]">{asset.category}{asset.fileSize ? ` · ${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : " · Drive reference"}</p>
                    {asset.note && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asset.note}</p>}
                    {asset.driveUrl && <a className="mt-2 inline-block break-all text-sm font-medium underline underline-offset-4" href={asset.driveUrl} target="_blank" rel="noreferrer">Open Google Drive reference</a>}
                  </div>
                  {editable && <button type="button" disabled={!ready || saving} onClick={() => void removeAsset(asset)} className="min-h-10 shrink-0 border border-[var(--line-strong)] px-3 text-sm font-semibold disabled:opacity-50">Remove</button>}
                </li>
              ))}
            </ul>
          )}

          {editable && <form onSubmit={addMaterials} className="mt-5 grid gap-3 border-t border-[var(--line)] pt-5">
            <label className="text-sm font-medium">Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Upload files
              <input id="sponsor-files" type="file" multiple onChange={chooseFiles} className="mt-2 block min-h-11 w-full border border-[var(--line-strong)] bg-white p-2 text-sm" />
            </label>
            {selectedFiles.length > 0 && <p className="text-xs leading-5 text-[var(--muted)]">{selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} selected · stored in this browser until you download the ZIP.</p>}
            <label className="text-sm font-medium">Material name for a Drive link
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Required when adding a Drive link" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Google Drive link (optional)
              <input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://drive.google.com/..." className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Note for this material
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
            <button type="submit" disabled={!ready || saving} className="min-h-11 justify-self-start bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Add to sponsor collection"}</button>
          </form>}
        </div>
      </section>

      <p className="text-xs leading-5 text-[var(--muted)]">The ZIP contains the sponsor information and uploaded files. Drive links are listed as references; their contents are not copied. Nothing is sent to Icarus from this page.</p>
    </div>
  );
}
