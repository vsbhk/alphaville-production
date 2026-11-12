import { google, type sheets_v4 } from "googleapis";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/oidc";

const SHEET_NAME = "Project Data";
const HEADERS = [["key", "payload_json", "updated_at", "updated_by"]];
const SHEET_A1 = `'${SHEET_NAME.replaceAll("'", "''")}'`;

function sheetRange(range: string) {
  return `${SHEET_A1}!${range}`;
}

function spreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not configured");
  return id;
}

async function sheetsClient(): Promise<sheets_v4.Sheets> {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (!projectNumber || !poolId || !providerId || !serviceAccountEmail) {
    throw new Error("Google workload identity is not configured");
  }
  const audience = `https://iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

  const auth = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience,
    subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    subject_token_supplier: {
      getSubjectToken: () => getVercelOidcToken({ audience }),
    },
  });
  if (!auth) throw new Error("Google workload identity configuration is invalid");
  return google.sheets({ version: "v4", auth });
}

async function ensureTable(client: sheets_v4.Sheets, id: string) {
  const spreadsheet = await client.spreadsheets.get({ spreadsheetId: id, fields: "sheets.properties" });
  const sheet = spreadsheet.data.sheets?.find((item) => item.properties?.title === SHEET_NAME);
  if (!sheet) {
    await client.spreadsheets.batchUpdate({
      spreadsheetId: id,
      requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
    });
  }
  const header = await client.spreadsheets.values.get({ spreadsheetId: id, range: sheetRange("A1:D1") });
  if (!header.data.values?.length) {
    await client.spreadsheets.values.update({
      spreadsheetId: id,
      range: sheetRange("A1:D1"),
      valueInputOption: "RAW",
      requestBody: { values: HEADERS },
    });
  }
}

export async function getWorkspaceRecord(key: string): Promise<unknown | null> {
  const client = await sheetsClient();
  const id = spreadsheetId();
  await ensureTable(client, id);
  const response = await client.spreadsheets.values.get({ spreadsheetId: id, range: sheetRange("A2:D") });
  const row = (response.data.values ?? []).find((item) => item[0] === key);
  if (!row?.[1]) return null;
  return JSON.parse(String(row[1])) as unknown;
}

export async function putWorkspaceRecord(key: string, payload: unknown, email: string) {
  const client = await sheetsClient();
  const id = spreadsheetId();
  await ensureTable(client, id);
  const values = await client.spreadsheets.values.get({ spreadsheetId: id, range: sheetRange("A2:D") });
  const rows = values.data.values ?? [];
  const index = rows.findIndex((item) => item[0] === key);
  const row = [key, JSON.stringify(payload), new Date().toISOString(), email];
  if (index >= 0) {
    const rowNumber = index + 2;
    await client.spreadsheets.values.update({
      spreadsheetId: id,
      range: sheetRange(`A${rowNumber}:D${rowNumber}`),
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } else {
    await client.spreadsheets.values.append({
      spreadsheetId: id,
      range: sheetRange("A:D"),
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  }
}
