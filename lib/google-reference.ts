import { google } from "googleapis";
import {
  REFERENCE_SHEET_GID,
  REFERENCE_SHEET_ID,
  getReferencePdfExportUrl,
} from "@/lib/reference-sheet";

function getServiceAccountCreds(): Record<string, string> | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

function getGoogleAuth() {
  const creds = getServiceAccountCreds();
  if (!creds) return null;
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
}

async function getSheetTitle(auth: NonNullable<ReturnType<typeof getGoogleAuth>>) {
  const sheets = google.sheets({ version: "v4", auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: REFERENCE_SHEET_ID });
  const sheet = meta.data.sheets?.find(
    (s) => String(s.properties?.sheetId) === REFERENCE_SHEET_GID
  );
  return sheet?.properties?.title ?? "Референс ОГЗ менеджер (м2)";
}

/** Значения ячеек (без формул — только отображаемый результат) */
export async function fetchReferenceTable(): Promise<string[][] | null> {
  const auth = getGoogleAuth();
  if (!auth) return null;

  try {
    const sheets = google.sheets({ version: "v4", auth });
    const title = await getSheetTitle(auth);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: `'${title.replace(/'/g, "''")}'!A1:ZZ500`,
    });
    const rows = (res.data.values as string[][] | undefined) ?? [];
    return trimTable(rows);
  } catch (e) {
    console.error("[reference] fetch table:", e);
    return null;
  }
}

export async function fetchReferencePdfBuffer(): Promise<ArrayBuffer | null> {
  const auth = getGoogleAuth();
  const url = getReferencePdfExportUrl();

  try {
    if (auth) {
      const client = await auth.getClient();
      const res = await client.request<ArrayBuffer>({
        url,
        responseType: "arraybuffer",
      });
      return res.data;
    }

    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch (e) {
    console.error("[reference] fetch pdf:", e);
    return null;
  }
}

function trimTable(rows: string[][]): string[][] {
  let lastRow = rows.length - 1;
  while (lastRow >= 0 && rows[lastRow].every((c) => !String(c ?? "").trim())) {
    lastRow--;
  }
  if (lastRow < 0) return [];

  const trimmed = rows.slice(0, lastRow + 1);
  let lastCol = 0;
  for (const row of trimmed) {
    for (let c = row.length - 1; c >= 0; c--) {
      if (String(row[c] ?? "").trim()) {
        lastCol = Math.max(lastCol, c);
        break;
      }
    }
  }

  return trimmed.map((row) =>
    row.slice(0, lastCol + 1).map((cell) => String(cell ?? ""))
  );
}
