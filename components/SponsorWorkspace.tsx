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
  status?: "Not reviewed" | "Needs input" | "Submitted" | "Approved";
  source?: string;
  receivedAt?: string;
  usageClearance?: string;
  accessInstructions?: string;
  linkExpiry?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
};

type SponsorContact = { type: string; name: string; role: string; email: string; phone: string };
type ReviewStatus = "Not reviewed" | "Needs input" | "Submitted" | "Approved";
type SponsorProfile = {
  submissionSource: string;
  submissionReceivedAt: string;
  contacts: SponsorContact[];
  brandGuidelines: string;
  keyMessages: string;
  boilerplate: string;
  spokespersonName: string;
  spokespersonTitle: string;
  spokespersonBiography: string;
  socialLinks: string;
  mediaClearance: string;
  storyPriorities: string;
  preferredLocation: string;
  alternateLocation: string;
  requestedDate: string;
  requestedTime: string;
  alternateRequestedDate: string;
  alternateRequestedTime: string;
  timezone: string;
  stagingRequirements: string;
  essentialFilmingMoments: string;
  filmingConfirmation: string;
  interviewDuration: string;
  availabilityNotes: string;
  diaryContact: string;
  badWeatherAlternative: string;
  absenceAlternative: string;
  finalApprover: string;
  backupApprover: string;
  approvalTurnaround: string;
  captionLanguages: string;
  spellingConfirmation: string;
  usageRestrictions: string;
  followUps: string;
  reviewedBy: string;
  reviewDate: string;
  reviewStatuses: Record<string, ReviewStatus>;
};
type SponsorRecord = { details?: SponsorDetails; profile?: Partial<SponsorProfile>; assets: SponsorAsset[]; updatedAt?: number };
type StorageMode = "cloud" | "local";

const emptyDetails: SponsorDetails = {
  brandName: "",
  contactName: "",
  contactPhone: "",
  website: "",
  brief: "",
  notes: "",
};
const emptyContact: SponsorContact = { type: "Primary", name: "", role: "", email: "", phone: "" };
const profileSections = [
  { id: "contacts", label: "Contacts" }, { id: "brand", label: "Brand materials" }, { id: "messages", label: "Key messages" },
  { id: "boilerplate", label: "Boilerplate" }, { id: "spokespeople", label: "Spokespeople" }, { id: "media", label: "Media and clearance" },
  { id: "story", label: "Story priorities" }, { id: "filming", label: "Filming" }, { id: "availability", label: "Availability" },
  { id: "approval", label: "Film approval" },
];
const reviewStatuses: ReviewStatus[] = ["Not reviewed", "Needs input", "Submitted", "Approved"];
const emptyProfile: SponsorProfile = {
  submissionSource: "", submissionReceivedAt: "", contacts: [emptyContact], brandGuidelines: "", keyMessages: "", boilerplate: "", spokespersonName: "", spokespersonTitle: "",
  spokespersonBiography: "", socialLinks: "", mediaClearance: "", storyPriorities: "", preferredLocation: "", alternateLocation: "",
  requestedDate: "", requestedTime: "", alternateRequestedDate: "", alternateRequestedTime: "", timezone: "HKT", filmingConfirmation: "", diaryContact: "", badWeatherAlternative: "",
  stagingRequirements: "", essentialFilmingMoments: "", interviewDuration: "", availabilityNotes: "",
  absenceAlternative: "", finalApprover: "", backupApprover: "", approvalTurnaround: "", captionLanguages: "", spellingConfirmation: "",
  usageRestrictions: "", followUps: "", reviewedBy: "", reviewDate: "",
  reviewStatuses: Object.fromEntries(profileSections.map(({ id }) => [id, "Not reviewed"])) as Record<string, ReviewStatus>,
};
const blankRecord: SponsorRecord = { details: emptyDetails, profile: emptyProfile, assets: [] };
const categories = ["Logos", "Brand guidelines", "Text and Word documents", "People and photos", "Video and audio", "Other"];

function normalizeRecord(saved: SponsorRecord | null): SponsorRecord {
  if (!saved || !Array.isArray(saved.assets)) return { ...blankRecord, profile: emptyProfile };
  const details = { ...emptyDetails, ...saved.details };
  const legacyContact = details.contactName || details.contactPhone
    ? [{ ...emptyContact, name: details.contactName, phone: details.contactPhone }]
    : emptyProfile.contacts;
  return {
    ...blankRecord,
    ...saved,
    details,
    profile: {
      ...emptyProfile,
      ...saved.profile,
      contacts: saved.profile?.contacts?.length ? saved.profile.contacts : legacyContact,
      reviewStatuses: { ...emptyProfile.reviewStatuses, ...saved.profile?.reviewStatuses },
    },
    assets: saved.assets.map((asset) => ({ ...asset, status: asset.status ?? (asset.approved ? "Approved" : "Not reviewed") })),
  };
}

export function SponsorWorkspace({ sponsorSlug, sponsorName, editable }: { sponsorSlug: string; sponsorName: string; editable: boolean }) {
  const key = `sponsor:${sponsorSlug}`;
  const [record, setRecord] = useState<SponsorRecord>(() => normalizeRecord(null));
  const [details, setDetails] = useState<SponsorDetails>(emptyDetails);
  const [profile, setProfile] = useState<SponsorProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<StorageMode>("cloud");
  const [message, setMessage] = useState("Loading sponsor collection…");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Logos");
  const [driveUrl, setDriveUrl] = useState("");
  const [note, setNote] = useState("");
  const [assetSource, setAssetSource] = useState("");
  const [assetReceivedAt, setAssetReceivedAt] = useState("");
  const [assetUsageClearance, setAssetUsageClearance] = useState("");
  const [assetAccessInstructions, setAssetAccessInstructions] = useState("");
  const [assetLinkExpiry, setAssetLinkExpiry] = useState("");
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
      setProfile({ ...emptyProfile, ...fallback.profile });
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
      setProfile({ ...emptyProfile, ...local.profile });
      setStorageMode("local");
      setMessage("A newer browser draft is available. Review it, then sync it to Google Sheets when ready.");
      setReady(true);
      return;
    }

    setRecord(remote);
    setDetails(remote.details ?? emptyDetails);
    setProfile({ ...emptyProfile, ...remote.profile });
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
          setProfile({ ...emptyProfile, ...updated.profile });
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
      setProfile({ ...emptyProfile, ...updated.profile });
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
    const primaryContact = profile.contacts[0] ?? emptyContact;
    const savedDetails = { ...details, contactName: primaryContact.name, contactPhone: primaryContact.phone };
    await save({ ...record, details: savedDetails, profile }, "Sponsor profile saved to your private workspace.");
  }

  function updateProfile<K extends keyof SponsorProfile>(field: K, value: SponsorProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateContact(index: number, field: keyof SponsorContact, value: string) {
    setProfile((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) => contactIndex === index ? { ...contact, [field]: value } : contact),
    }));
  }

  function addContact() {
    setProfile((current) => ({ ...current, contacts: [...current.contacts, { ...emptyContact, type: "Additional" }] }));
  }

  function removeContact(index: number) {
    setProfile((current) => ({ ...current, contacts: current.contacts.filter((_, contactIndex) => contactIndex !== index) }));
  }

  function setReviewStatus(sectionId: string, status: ReviewStatus) {
    setProfile((current) => ({ ...current, reviewStatuses: { ...current.reviewStatuses, [sectionId]: status } }));
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
        const host = parsed.hostname.toLowerCase();
        const allowedHost = ["drive.google.com", "docs.google.com", "dropbox.com", "www.dropbox.com", "wetransfer.com", "www.wetransfer.com", "we.tl", "1drv.ms", "onedrive.live.com"].includes(host) || host.endsWith(".sharepoint.com");
        if (parsed.protocol !== "https:" || !allowedHost) throw new Error("Invalid file link");
      } catch {
        setError("Use a valid HTTPS link from Google Drive, Dropbox, WeTransfer or OneDrive, or clear the link field.");
        return;
      }
    }
    if (selectedFiles.length === 0 && (!cleanUrl || !cleanTitle)) {
      setError("Choose at least one file, or provide both a material name and file link.");
      return;
    }

    const newAssets: SponsorAsset[] = selectedFiles.map((file) => {
      const id = globalThis.crypto.randomUUID();
      return { id, fileId: id, fileName: file.name, fileSize: file.size, title: file.name, category, driveUrl: "", note: note.trim(), status: "Not reviewed", source: assetSource.trim(), receivedAt: assetReceivedAt, usageClearance: assetUsageClearance.trim(), accessInstructions: assetAccessInstructions.trim(), linkExpiry: assetLinkExpiry };
    });
    if (cleanUrl) newAssets.push({ id: globalThis.crypto.randomUUID(), title: cleanTitle, category, driveUrl: cleanUrl, note: note.trim(), status: "Not reviewed", source: assetSource.trim(), receivedAt: assetReceivedAt, usageClearance: assetUsageClearance.trim(), accessInstructions: assetAccessInstructions.trim(), linkExpiry: assetLinkExpiry });

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
    setAssetSource("");
    setAssetReceivedAt("");
    setAssetUsageClearance("");
    setAssetAccessInstructions("");
    setAssetLinkExpiry("");
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
      const archive = await createSponsorArchive({ sponsorName, sponsorSlug, details: record.details ?? emptyDetails, profile: record.profile, assets: record.assets, files });
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
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Keep each sponsor submission, approval detail and production requirement in its own field.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Brand or company name
              <input value={details.brandName} onChange={(event) => setDetails({ ...details, brandName: event.target.value })} placeholder={sponsorName} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Website
              <input value={details.website} onChange={(event) => setDetails({ ...details, website: event.target.value })} placeholder="https://" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Submission source / sender
              <input value={profile.submissionSource} onChange={(event) => updateProfile("submissionSource", event.target.value)} placeholder="Email, sponsor portal, meeting, etc." className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Submission received date
              <input type="date" value={profile.submissionReceivedAt} onChange={(event) => updateProfile("submissionReceivedAt", event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
          </div>
          <label className="mt-3 block text-sm font-medium">Brief and requirements
            <textarea value={details.brief} onChange={(event) => setDetails({ ...details, brief: event.target.value })} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
          </label>
          <label className="mt-3 block text-sm font-medium">Additional notes
            <textarea value={details.notes} onChange={(event) => setDetails({ ...details, notes: event.target.value })} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
          </label>

          <aside className="mt-5 border border-[var(--line)] bg-[var(--background)] p-4" aria-labelledby="recommendations-title">
            <h4 id="recommendations-title" className="text-sm font-semibold">Recommended intake checks</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted)]">
              <li>Record the source and received date for every file or text submission.</li>
              <li>Confirm image, footage, logo and music usage rights, restrictions and expiry dates.</li>
              <li>Track content review separately from filming-slot confirmation.</li>
              <li>Get a named day-of contact and weather or absence alternative before filming.</li>
              <li>Keep sponsor copy verbatim and record spelling, caption-language and turnaround expectations.</li>
            </ul>
          </aside>

          <fieldset className="mt-5 border-t border-[var(--line)] pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="text-sm font-semibold">Production contacts</legend>
              <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                <select value={profile.reviewStatuses.contacts} onChange={(event) => setReviewStatus("contacts", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">
                  {reviewStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Add primary, backup, day-of and approval contacts with their roles and direct details.</p>
            <div className="mt-3 space-y-3">
              {profile.contacts.map((contact, index) => <div key={`${index}-${contact.type}`} className="grid gap-3 border border-[var(--line)] p-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Contact type
                  <input value={contact.type} onChange={(event) => updateContact(index, "type", event.target.value)} placeholder="Primary / Backup / PA" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Name
                  <input value={contact.name} onChange={(event) => updateContact(index, "name", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Role
                  <input value={contact.role} onChange={(event) => updateContact(index, "role", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Email
                  <input type="email" value={contact.email} onChange={(event) => updateContact(index, "email", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Phone
                  <input type="tel" value={contact.phone} onChange={(event) => updateContact(index, "phone", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                {editable && profile.contacts.length > 1 && <button type="button" onClick={() => removeContact(index)} className="min-h-9 justify-self-start border border-[var(--line-strong)] px-3 text-xs font-semibold">Remove contact</button>}
              </div>)}
            </div>
            {editable && <button type="button" onClick={addContact} className="mt-3 min-h-10 border border-[var(--line-strong)] bg-white px-3 text-sm font-semibold">Add contact</button>}
          </fieldset>

          <div className="mt-5 grid gap-5 border-t border-[var(--line)] pt-5">
            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Brand materials</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.brand} onChange={(event) => setReviewStatus("brand", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Brand guidelines and logo requirements
                <textarea value={profile.brandGuidelines} onChange={(event) => updateProfile("brandGuidelines", event.target.value)} rows={3} placeholder="Guidelines, logo variants, formats, clear space and usage notes" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Key messages</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.messages} onChange={(event) => setReviewStatus("messages", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Approved key messages
                <textarea value={profile.keyMessages} onChange={(event) => updateProfile("keyMessages", event.target.value)} rows={6} placeholder="Keep each supplied point verbatim; separate points with a blank line." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Boilerplate</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.boilerplate} onChange={(event) => setReviewStatus("boilerplate", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Boilerplate text and footnotes
                <textarea value={profile.boilerplate} onChange={(event) => updateProfile("boilerplate", event.target.value)} rows={6} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Spokespeople and social channels</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.spokespeople} onChange={(event) => setReviewStatus("spokespeople", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Spokesperson name
                  <input value={profile.spokespersonName} onChange={(event) => updateProfile("spokespersonName", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Title and organisation
                  <input value={profile.spokespersonTitle} onChange={(event) => updateProfile("spokespersonTitle", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Biography
                <textarea value={profile.spokespersonBiography} onChange={(event) => updateProfile("spokespersonBiography", event.target.value)} rows={4} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
              <label className="mt-3 block text-sm font-medium">Social media URLs
                <textarea value={profile.socialLinks} onChange={(event) => updateProfile("socialLinks", event.target.value)} rows={3} placeholder="One platform and URL per line" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Media and clearance</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.media} onChange={(event) => setReviewStatus("media", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Usage clearance, restrictions and expiry
                <textarea value={profile.mediaClearance} onChange={(event) => updateProfile("mediaClearance", event.target.value)} rows={3} placeholder="Record rights holder, permitted use, restrictions and expiry date." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Story priorities</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.story} onChange={(event) => setReviewStatus("story", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <label className="mt-3 block text-sm font-medium">Contribution, story and filming priorities
                <textarea value={profile.storyPriorities} onChange={(event) => updateProfile("storyPriorities", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Filming preferences</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.filming} onChange={(event) => setReviewStatus("filming", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Preferred location
                  <input value={profile.preferredLocation} onChange={(event) => updateProfile("preferredLocation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location
                  <input value={profile.alternateLocation} onChange={(event) => updateProfile("alternateLocation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location date
                  <input type="date" value={profile.alternateRequestedDate} onChange={(event) => updateProfile("alternateRequestedDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Alternative location time
                  <input value={profile.alternateRequestedTime} onChange={(event) => updateProfile("alternateRequestedTime", event.target.value)} placeholder="e.g. 3:00–5:00 pm" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Requested date
                  <input type="date" value={profile.requestedDate} onChange={(event) => updateProfile("requestedDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Requested time
                  <input value={profile.requestedTime} onChange={(event) => updateProfile("requestedTime", event.target.value)} placeholder="e.g. 3:00–5:00 pm" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Timezone
                  <input value={profile.timezone} onChange={(event) => updateProfile("timezone", event.target.value)} placeholder="HKT" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Sponsor confirmation / booking status
                  <input value={profile.filmingConfirmation} onChange={(event) => updateProfile("filmingConfirmation", event.target.value)} placeholder="Pending sponsor confirmation / Not booked" className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Staging requirements
                  <textarea value={profile.stagingRequirements} onChange={(event) => updateProfile("stagingRequirements", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
                <label className="text-sm font-medium">Essential moments to capture
                  <textarea value={profile.essentialFilmingMoments} onChange={(event) => updateProfile("essentialFilmingMoments", event.target.value)} rows={3} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Availability and contingencies</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.availability} onChange={(event) => setReviewStatus("availability", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">Availability notes
                  <textarea value={profile.availabilityNotes} onChange={(event) => updateProfile("availabilityNotes", event.target.value)} rows={2} placeholder="Availability statement from the sponsor" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
                </label>
                <label className="text-sm font-medium">Diarist / PA / day-of contact
                  <input value={profile.diaryContact} onChange={(event) => updateProfile("diaryContact", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Interview duration
                  <input value={profile.interviewDuration} onChange={(event) => updateProfile("interviewDuration", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Bad-weather alternative
                  <input value={profile.badWeatherAlternative} onChange={(event) => updateProfile("badWeatherAlternative", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium sm:col-span-2">Absence / rescheduling alternative
                  <input value={profile.absenceAlternative} onChange={(event) => updateProfile("absenceAlternative", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Film approval</legend>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">Review status
                  <select value={profile.reviewStatuses.approval} onChange={(event) => setReviewStatus("approval", event.target.value as ReviewStatus)} disabled={!editable} className="h-9 border border-[var(--line-strong)] bg-white px-2 text-[var(--foreground)]">{reviewStatuses.map((status) => <option key={status}>{status}</option>)}</select>
                </label>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Final approver
                  <input value={profile.finalApprover} onChange={(event) => updateProfile("finalApprover", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Backup approver
                  <input value={profile.backupApprover} onChange={(event) => updateProfile("backupApprover", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Expected turnaround
                  <input value={profile.approvalTurnaround} onChange={(event) => updateProfile("approvalTurnaround", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Caption languages
                  <input value={profile.captionLanguages} onChange={(event) => updateProfile("captionLanguages", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Confirmed name spellings
                  <input value={profile.spellingConfirmation} onChange={(event) => updateProfile("spellingConfirmation", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Usage restrictions
                  <input value={profile.usageRestrictions} onChange={(event) => updateProfile("usageRestrictions", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
            </fieldset>

            <fieldset className="border-t border-[var(--line)] pt-4">
              <legend className="text-sm font-semibold">Latest review record</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Reviewed by
                  <input value={profile.reviewedBy} onChange={(event) => updateProfile("reviewedBy", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
                <label className="text-sm font-medium">Review date
                  <input type="date" value={profile.reviewDate} onChange={(event) => updateProfile("reviewDate", event.target.value)} className="mt-2 h-10 w-full border border-[var(--line-strong)] bg-white px-3" />
                </label>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Section statuses are saved independently. Record a reviewer and date whenever a review is completed.</p>
            </fieldset>

            <label className="block text-sm font-medium">Outstanding follow-ups and recommendations
              <textarea value={profile.followUps} onChange={(event) => updateProfile("followUps", event.target.value)} rows={3} placeholder="List missing files, unanswered questions, owners and follow-up dates." className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
          </div>
          {editable && <button type="submit" disabled={!ready || saving} className="mt-4 min-h-11 bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save sponsor information"}</button>}
        </form>

        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Files and references</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Add source files and file links for the final handoff.</p>
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
                    <p className="mt-1 text-xs font-medium text-[var(--muted)]">{asset.category}{asset.fileSize ? ` · ${(asset.fileSize / (1024 * 1024)).toFixed(1)} MB` : asset.driveUrl ? " · File reference" : " · File pending"} · {asset.status ?? (asset.approved ? "Approved" : "Not reviewed")}</p>
                    {asset.source && <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Source: {asset.source}</p>}
                    {asset.receivedAt && <p className="text-xs leading-5 text-[var(--muted)]">Received: {asset.receivedAt}</p>}
                    {asset.note && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{asset.note}</p>}
                    {asset.usageClearance && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Usage clearance: {asset.usageClearance}</p>}
                    {asset.accessInstructions && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Access instructions: {asset.accessInstructions}</p>}
                    {asset.linkExpiry && <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Link expiry: {asset.linkExpiry}</p>}
                    {asset.driveUrl && <a className="mt-2 inline-block break-all text-sm font-medium underline underline-offset-4" href={asset.driveUrl} target="_blank" rel="noreferrer">Open file reference</a>}
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
            <label className="text-sm font-medium">Material name for a file link
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Required when adding a file link" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">File link (Google Drive, Dropbox, WeTransfer or OneDrive)
              <input type="url" value={driveUrl} onChange={(event) => setDriveUrl(event.target.value)} placeholder="https://…" className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
            </label>
            <label className="text-sm font-medium">Note for this material
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Source / sender
                <input value={assetSource} onChange={(event) => setAssetSource(event.target.value)} placeholder="Email, sponsor portal, OneDrive, etc." className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
              <label className="text-sm font-medium">Date received
                <input type="date" value={assetReceivedAt} onChange={(event) => setAssetReceivedAt(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
            </div>
            <label className="text-sm font-medium">Rights and usage clearance
              <textarea value={assetUsageClearance} onChange={(event) => setAssetUsageClearance(event.target.value)} rows={2} placeholder="Permitted uses, restrictions, rights holder and expiry date" className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
            </label>
              <label className="text-sm font-medium">Access instructions for large files
                <textarea value={assetAccessInstructions} onChange={(event) => setAssetAccessInstructions(event.target.value)} rows={2} className="mt-2 w-full border border-[var(--line-strong)] bg-white p-3" />
              </label>
              <label className="text-sm font-medium">Link expiry date
                <input type="date" value={assetLinkExpiry} onChange={(event) => setAssetLinkExpiry(event.target.value)} className="mt-2 h-11 w-full border border-[var(--line-strong)] bg-white px-3" />
              </label>
            <button type="submit" disabled={!ready || saving} className="min-h-11 justify-self-start bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Add to sponsor collection"}</button>
          </form>}
        </div>
      </section>

      <p className="text-xs leading-5 text-[var(--muted)]">The ZIP contains the sponsor information and uploaded files. Drive links are listed as references; their contents are not copied. Nothing is sent to Icarus from this page.</p>
    </div>
  );
}
