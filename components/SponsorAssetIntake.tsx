"use client";

import { ChangeEvent, DragEvent, useState } from "react";

const allowedExtensions = new Set(["ai", "eps", "svg", "png", "jpg", "jpeg", "webp", "pdf", "doc", "docx", "txt"]);
const acceptedFiles = ".ai,.eps,.svg,.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt";
const maxFileBytes = 3 * 1024 * 1024;
const maxFilesPerSponsor = 30;

type StagedFile = { file: File; sponsor: string; category: string };

function humanSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SponsorAssetIntake({ sponsors }: { sponsors: string[] }) {
  const [sponsor, setSponsor] = useState("");
  const [category, setCategory] = useState("Logos");
  const [selected, setSelected] = useState<File[]>([]);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [driveLink, setDriveLink] = useState("");

  function addFiles(incoming: FileList | File[]) {
    const valid: File[] = [];
    const rejected: string[] = [];

    Array.from(incoming).forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowedExtensions.has(extension)) {
        rejected.push(`${file.name}: file type not supported`);
      } else if (file.size > maxFileBytes) {
        rejected.push(`${file.name}: larger than 3 MB`);
      } else {
        valid.push(file);
      }
    });

    setSelected((current) => [...current, ...valid]);
    setError(rejected.join(". "));
    setNotice("");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  }

  function stageFiles() {
    if (!sponsor || selected.length === 0) return;
    const existingCount = staged.filter((item) => item.sponsor === sponsor).length;
    if (existingCount + selected.length > maxFilesPerSponsor) {
      setError(`${sponsor} can have up to ${maxFilesPerSponsor} files staged in this preview. Remove ${existingCount + selected.length - maxFilesPerSponsor} file${existingCount + selected.length - maxFilesPerSponsor === 1 ? "" : "s"} first.`);
      return;
    }
    setStaged((current) => [...current, ...selected.map((file) => ({ file, sponsor, category }))]);
    setNotice(`${selected.length} file${selected.length === 1 ? "" : "s"} staged in this preview for ${sponsor}. Files are not saved to project storage.`);
    setSelected([]);
    setError("");
  }

  function stageDriveLink() {
    if (!sponsor || !driveLink) return;
    setNotice(`Google Drive link staged in this preview for ${sponsor}. It is not saved to project storage.`);
    setDriveLink("");
  }

  return (
    <section className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="asset-intake-title">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Material intake · preview only</p>
        <h2 id="asset-intake-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Add sponsor material</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Choose the sponsor and file type first, then drop files here or browse. Supported files are up to 3 MB each. Up to 30 files can be staged per sponsor in this browser preview.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="intake-sponsor" className="mb-2 block text-sm font-medium">Sponsor</label>
          <select id="intake-sponsor" value={sponsor} onChange={(event) => setSponsor(event.target.value)} className="h-12 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10">
            <option value="">Select a sponsor</option>
            {sponsors.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="intake-category" className="mb-2 block text-sm font-medium">File category</label>
          <select id="intake-category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10">
            <option>Logos</option>
            <option>Brand guidelines</option>
            <option>Text and Word documents</option>
            <option>People and photos</option>
          </select>
        </div>
      </div>

      <div
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false); }}
        onDrop={handleDrop}
        className={`mt-5 rounded-lg border-2 border-dashed p-6 text-center transition sm:p-8 ${isDragging ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--line-strong)] bg-[var(--background)]"}`}
      >
        <input id="sponsor-files" className="sr-only" type="file" multiple accept={acceptedFiles} onChange={handleInputChange} />
        <p className="text-sm font-semibold">Drop files to add them to the intake</p>
        <p className="mt-1 text-sm text-[var(--muted)]">AI, EPS, SVG, PNG, JPG, WebP, PDF, DOC, DOCX or TXT</p>
        <label htmlFor="sponsor-files" className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-md border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold hover:border-[var(--accent)]">
          Browse files
        </label>
      </div>

      {selected.length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--line)] p-4">
          <p className="text-sm font-semibold">Selected files</p>
          <ul className="mt-2 space-y-2">
            {selected.map((file, index) => (
              <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 break-all">{file.name} <span className="text-[var(--muted)]">· {humanSize(file.size)}</span></span>
                <button type="button" onClick={() => setSelected((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="min-h-11 shrink-0 px-2 font-medium text-[var(--accent)] underline underline-offset-4">Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={stageFiles} disabled={!sponsor} className="mt-4 min-h-11 rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Stage files</button>
          {!sponsor && <p className="mt-2 text-xs text-[var(--muted)]">Choose a sponsor before staging files.</p>}
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-md border border-[var(--line)] bg-white p-3 text-sm leading-6">{notice}</p>}

      <div className="mt-6 border-t border-[var(--line)] pt-5">
        <p className="text-sm font-semibold">Large files</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Use a Google Drive link for larger files. This personal workspace does not change Drive sharing permissions.</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="google-drive-link">Google Drive link</label>
          <input id="google-drive-link" type="url" value={driveLink} onChange={(event) => setDriveLink(event.target.value)} placeholder="Paste a Google Drive link" className="h-12 min-w-0 flex-1 rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
          <button type="button" disabled={!sponsor || !driveLink} onClick={stageDriveLink} className="min-h-12 rounded-md border border-[var(--line-strong)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Stage link</button>
        </div>
        {!sponsor && <p className="mt-2 text-xs text-[var(--muted)]">Choose a sponsor above before adding a Drive link.</p>}
      </div>

      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <p className="text-xs leading-5 text-[var(--muted)]">Privacy: this is an interactive design preview. Selected files and links are only held in browser memory and are not uploaded or stored. Sponsor-only access and project-scoped storage must be connected before using real material.</p>
        {staged.length > 0 && <p className="mt-2 text-xs text-[var(--muted)]">{staged.length} file{staged.length === 1 ? "" : "s"} staged in this browser preview. {sponsors.map((name) => `${name}: ${staged.filter((item) => item.sponsor === name).length}/30`).filter((line) => !line.endsWith("0/30")).join(" · ")}</p>}
      </div>
    </section>
  );
}
