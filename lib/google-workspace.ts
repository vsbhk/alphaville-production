import { google, type sheets_v4 } from "googleapis";

const SHEET_NAME = "Project Data";
const HEADERS = [["key", "payload_json", "updated_at", "updated_by"]];

function spreadsheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not configured");
  return id;
}

function sheetsClient(): sheets_v4.Sheets {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  const credentials = JSON.parse(raw) as { client_email?: string; private_key?: string };
  if (!credentials.client_email || !credentials.private_key) throw new Error("Google service account JSON is incomplete");
  const auth = new google.auth.GoogleAuth({
    credentials: { ...credentials, private_key: credentials.private_key.replace(/\\n/g, "\n") },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
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
  const header = await client.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET_NAME}!A1:D1` });
  if (!header.data.values?.length) {
    await client.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${SHEET_NAME}!A1:D1`,
      valueInputOption: "RAW",
      requestBody: { values: HEADERS },
    });
  }
}

export async function getWorkspaceRecord(key: string): Promise<unknown | null> {
  const client = sheetsClient();
  const id = spreadsheetId();
  await ensureTable(client, id);
  const response = await client.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET_NAME}!A2:D` });
  const row = (response.data.values ?? []).find((item) => item[0] === key);
  if (!row?.[1]) return null;
  return JSON.parse(String(row[1])) as unknown;
}

export async function putWorkspaceRecord(key: string, payload: unknown, email: string) {
  const client = sheetsClient();
  const id = spreadsheetId();
  await ensureTable(client, id);
  const values = await client.spreadsheets.values.get({ spreadsheetId: id, range: `${SHEET_NAME}!A2:D` });
  const rows = values.data.values ?? [];
  const index = rows.findIndex((item) => item[0] === key);
  const row = [key, JSON.stringify(payload), new Date().toISOString(), email];
  if (index >= 0) {
    const rowNumber = index + 2;
    await client.spreadsheets.values.update({
      spreadsheetId: id,
      range: `${SHEET_NAME}!A${rowNumber}:D${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } else {
    await client.spreadsheets.values.append({
      spreadsheetId: id,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  }
}
