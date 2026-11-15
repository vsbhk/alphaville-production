import { projectSponsors } from "@/lib/sponsors";

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
let cachedToken: string | null = null;
let cachedTokenUntil = 0;

export function isDropboxConfigured() {
  return Boolean(appKey && appSecret && refreshToken);
}

export function sponsorDropboxPath(slug: string) {
  if (!projectSponsors.some((sponsor) => sponsor.slug === slug)) throw new Error("Unknown sponsor");
  return `/Sponsor Files/${slug}`;
}

export async function getDropboxAccessToken(): Promise<string> {
  if (!appKey || !appSecret || !refreshToken) throw new Error("Dropbox is not configured");
  if (cachedToken && Date.now() < cachedTokenUntil) return cachedToken;
  const basic = Buffer.from(`${appKey}:${appSecret}`).toString("base64");
  const response = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Dropbox authorization failed");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Dropbox did not return an access token");
  cachedToken = payload.access_token;
  cachedTokenUntil = Date.now() + 3_000_000;
  return cachedToken;
}

export async function getDropboxTemporaryLink(path: string): Promise<string> {
  const token = await getDropboxAccessToken();
  const response = await fetch("https://api.dropboxapi.com/2/files/get_temporary_link", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Dropbox file link is unavailable");
  const payload = await response.json() as { link?: string };
  if (!payload.link) throw new Error("Dropbox did not return a file link");
  return payload.link;
}
