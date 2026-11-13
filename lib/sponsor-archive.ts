import type { StoredSponsorFile } from "@/lib/sponsor-file-store";

export type SponsorDetails = {
  brandName: string;
  contactName: string;
  contactPhone: string;
  website: string;
  brief: string;
  notes: string;
};

export type SponsorAssetForArchive = {
  title: string;
  category: string;
  driveUrl: string;
  note: string;
  status?: string;
  source?: string;
  receivedAt?: string;
  usageClearance?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
};

const encoder = new TextEncoder();
const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function cleanName(value: string) {
  return value.normalize("NFKC").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").trim() || "file";
}

function dosDateTime(date: Date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = Math.max(1, date.getDate());
  const year = Math.max(1980, date.getFullYear()) - 1980;
  const packedDate = (year << 9) | ((date.getMonth() + 1) << 5) | day;
  return { time, date: packedDate };
}

type ZipEntry = { name: string; data: Uint8Array };

function zipStored(entries: ZipEntry[]): Blob {
  const encoderEntries = entries.map((entry) => ({ ...entry, nameBytes: encoder.encode(entry.name), checksum: crc32(entry.data) }));
  const totalBytes = encoderEntries.reduce((sum, entry) => sum + entry.data.byteLength + entry.nameBytes.byteLength * 2 + 76, 22);
  if (totalBytes > 0xffffffff || encoderEntries.length > 0xffff) throw new Error("This collection is too large for a standard ZIP archive.");
  const output = new Uint8Array(totalBytes);
  const view = new DataView(output.buffer);
  const stamp = dosDateTime(new Date());
  const central: { name: Uint8Array; crc: number; size: number; offset: number }[] = [];
  let offset = 0;

  for (const entry of encoderEntries) {
    const start = offset;
    view.setUint32(offset, 0x04034b50, true); offset += 4;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 0x0800, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, stamp.time, true); offset += 2;
    view.setUint16(offset, stamp.date, true); offset += 2;
    view.setUint32(offset, entry.checksum, true); offset += 4;
    view.setUint32(offset, entry.data.byteLength, true); offset += 4;
    view.setUint32(offset, entry.data.byteLength, true); offset += 4;
    view.setUint16(offset, entry.nameBytes.byteLength, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    output.set(entry.nameBytes, offset); offset += entry.nameBytes.byteLength;
    output.set(entry.data, offset); offset += entry.data.byteLength;
    central.push({ name: entry.nameBytes, crc: entry.checksum, size: entry.data.byteLength, offset: start });
  }

  const centralStart = offset;
  for (const entry of central) {
    view.setUint32(offset, 0x02014b50, true); offset += 4;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 20, true); offset += 2;
    view.setUint16(offset, 0x0800, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, stamp.time, true); offset += 2;
    view.setUint16(offset, stamp.date, true); offset += 2;
    view.setUint32(offset, entry.crc, true); offset += 4;
    view.setUint32(offset, entry.size, true); offset += 4;
    view.setUint32(offset, entry.size, true); offset += 4;
    view.setUint16(offset, entry.name.byteLength, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint32(offset, 0, true); offset += 4;
    view.setUint32(offset, entry.offset, true); offset += 4;
    output.set(entry.name, offset); offset += entry.name.byteLength;
  }

  const centralSize = offset - centralStart;
  view.setUint32(offset, 0x06054b50, true); offset += 4;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint16(offset, 0, true); offset += 2;
  view.setUint16(offset, central.length, true); offset += 2;
  view.setUint16(offset, central.length, true); offset += 2;
  view.setUint32(offset, centralSize, true); offset += 4;
  view.setUint32(offset, centralStart, true); offset += 4;
  view.setUint16(offset, 0, true);
  return new Blob([output], { type: "application/zip" });
}

export async function createSponsorArchive({
  sponsorName,
  sponsorSlug,
  details,
  profile,
  assets,
  files,
}: {
  sponsorName: string;
  sponsorSlug: string;
  details: SponsorDetails;
  profile?: object;
  assets: SponsorAssetForArchive[];
  files: Map<string, StoredSponsorFile>;
}): Promise<Blob> {
  const root = cleanName(sponsorSlug);
  const generatedAt = new Date().toLocaleString("en-HK", { timeZone: "Asia/Hong_Kong" });
  const lines = [
    `${sponsorName} — HKDW 2027 sponsor collection`,
    `Prepared: ${generatedAt} HKT`,
    "",
    "SPONSOR DETAILS",
    `Brand / company: ${details.brandName || sponsorName}`,
    `Contact: ${details.contactName || "Not provided"}`,
    `Phone: ${details.contactPhone || "Not provided"}`,
    `Website: ${details.website || "Not provided"}`,
    "",
    "BRIEF AND REQUIREMENTS",
    details.brief || "Not provided",
    "",
    "NOTES",
    details.notes || "None",
    "",
    "STRUCTURED SPONSOR PROFILE",
    profile ? JSON.stringify(profile, null, 2) : "Not provided",
    "",
    "FILES AND REFERENCES",
    ...assets.map((asset, index) => {
      const name = asset.fileName || asset.title;
      const filePart = asset.fileId ? `File: ${root}/files/${cleanName(asset.category)}/${String(index + 1).padStart(2, "0")}-${cleanName(name)}` : "No uploaded file";
      const linkPart = asset.driveUrl ? `Drive link (reference only; linked contents are not included): ${asset.driveUrl}` : "";
      return [
        `${index + 1}. ${asset.title}`,
        `Category: ${asset.category}`,
        `Status: ${asset.status ?? "Not reviewed"}`,
        asset.source ? `Source: ${asset.source}` : "",
        asset.receivedAt ? `Received: ${asset.receivedAt}` : "",
        filePart,
        asset.note ? `Note: ${asset.note}` : "",
        asset.usageClearance ? `Usage clearance: ${asset.usageClearance}` : "",
        linkPart,
      ].filter(Boolean).join("\n");
    }),
  ];

  const entries: ZipEntry[] = [{ name: `${root}/SPONSOR-INFO.txt`, data: encoder.encode(lines.join("\n")) }];
  let totalFileBytes = 0;
  for (const [index, asset] of assets.entries()) {
    if (!asset.fileId) continue;
    const stored = files.get(asset.fileId);
    if (!stored) throw new Error(`The file “${asset.fileName || asset.title}” is not available in this browser. Re-add it before exporting the ZIP.`);
    totalFileBytes += stored.file.size;
    if (totalFileBytes > 1024 * 1024 * 1024) throw new Error("This collection is over 1 GB. Export fewer files at a time.");
    const folder = cleanName(asset.category);
    const name = cleanName(stored.name || asset.fileName || asset.title);
    const bytes = new Uint8Array(await stored.file.arrayBuffer());
    entries.push({ name: `${root}/files/${folder}/${String(index + 1).padStart(2, "0")}-${name}`, data: bytes });
  }
  return zipStored(entries);
}
