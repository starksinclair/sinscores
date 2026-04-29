/**
 * Google Sheets tab names (exact, case sensitive):
 * Leagues, Seasons, Teams, Players, League_Players,
 * Games, Stats, Stat_Types, "Form Responses 3"
 */

import { createPrivateKey, createSign } from "crypto";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
}

export class SheetsAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetsAuthError";
  }
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createJwt(key: ServiceAccountKey): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: key.client_email,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  const sign = createSign("RSA-SHA256");
  sign.update(signatureInput);
  const privateKey = createPrivateKey({
    key: key.private_key,
    format: "pem",
  });
  const signature = sign.sign(privateKey);
  const signatureB64 = signature
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${signatureInput}.${signatureB64}`;
}

async function exchangeJwtForToken(key: ServiceAccountKey): Promise<string> {
  const jwt = createJwt(key);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new SheetsAuthError(`Token exchange failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  return data.access_token;
}

function getColumnLetter(n: number): string {
  let result = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result || "A";
}

function escapeRangeComponent(name: string): string {
  if (name.includes(" ") || name.includes("'")) {
    return `'${name.replace(/'/g, "''")}'`;
  }
  return name;
}

export class SheetsClient {
  private readonly spreadsheetId: string;
  private readonly key: ServiceAccountKey;
  private accessToken: string | null = null;
  private tokenExpiry = 0;
  private sheetIdCache: Map<string, number> = new Map();

  constructor(spreadsheetId?: string) {
    const id = spreadsheetId ?? process.env.GOOGLE_SHEETS_ID;
    if (!id?.trim()) {
      throw new Error("GOOGLE_SHEETS_ID or spreadsheetId must be set");
    }
    this.spreadsheetId = id.trim();

    const keyJson =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ??
      process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!keyJson?.trim()) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT must be set",
      );
    }
    this.key = JSON.parse(keyJson.trim()) as ServiceAccountKey;
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && this.tokenExpiry > now + 60000) {
      return this.accessToken;
    }
    this.accessToken = await exchangeJwtForToken(this.key);
    this.tokenExpiry = Date.now() + 3500 * 1000;
    return this.accessToken;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    tabName: string,
    operation: string,
    isRetry = false,
  ): Promise<Response> {
    const token = await this.getAccessToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      console.error(`[SheetsClient] ${operation} ${tabName}: 401 Unauthorized`);
      throw new SheetsAuthError("Unauthorized: invalid or expired credentials");
    }

    if (res.status === 429 && !isRetry) {
      console.warn(
        `[SheetsClient] ${operation} ${tabName}: 429, retrying after 1s`,
      );
      await new Promise((r) => setTimeout(r, 1000));
      return this.fetchWithRetry(url, options, tabName, operation, true);
    }

    if ((res.status === 500 || res.status === 503) && !isRetry) {
      console.warn(
        `[SheetsClient] ${operation} ${tabName}: ${res.status}, retrying after 500ms`,
      );
      await new Promise((r) => setTimeout(r, 500));
      return this.fetchWithRetry(url, options, tabName, operation, true);
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[SheetsClient] ${operation} ${tabName}: ${res.status} ${text}`,
      );
      throw new Error(`Sheets API error: ${res.status} ${text}`);
    }

    return res;
  }

  private async getSheetId(tabName: string): Promise<number> {
    const cached = this.sheetIdCache.get(tabName);
    if (cached !== undefined) return cached;

    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}?fields=sheets(properties(sheetId,title))`;
    const res = await this.fetchWithRetry(
      url,
      { method: "GET" },
      tabName,
      "getSheetId",
    );
    const data = (await res.json()) as {
      sheets?: { properties: { sheetId: number; title: string } }[];
    };
    const sheet = data.sheets?.find((s) => s.properties.title === tabName);
    if (!sheet) {
      throw new Error(`Sheet tab "${tabName}" not found`);
    }
    this.sheetIdCache.set(tabName, sheet.properties.sheetId);
    return sheet.properties.sheetId;
  }

  async getRows(tabName: string): Promise<string[][]> {
    const range = `${escapeRangeComponent(tabName)}!A:ZZ`;
    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await this.fetchWithRetry(
      url,
      { method: "GET" },
      tabName,
      "getRows",
    );
    const data = (await res.json()) as { values?: string[][] };
    return data.values ?? [];
  }

  async appendRow(tabName: string, row: string[]): Promise<void> {
    const range = `${escapeRangeComponent(tabName)}!A:ZZ`;
    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    await this.fetchWithRetry(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      },
      tabName,
      "appendRow",
    );
  }

  async updateRow(
    tabName: string,
    rowIndex: number,
    row: string[],
  ): Promise<void> {
    const range = `${escapeRangeComponent(tabName)}!A${rowIndex + 1}:${getColumnLetter(row.length)}${rowIndex + 1}`;
    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    await this.fetchWithRetry(
      url,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      },
      tabName,
      "updateRow",
    );
  }

  async deleteRow(tabName: string, rowIndex: number): Promise<void> {
    const sheetId = await this.getSheetId(tabName);
    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}:batchUpdate`;
    const body = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    };
    await this.fetchWithRetry(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      tabName,
      "deleteRow",
    );
    this.sheetIdCache.delete(tabName);
  }

  async findRowIndex(
    tabName: string,
    columnIndex: number,
    value: string,
  ): Promise<number> {
    const rows = await this.getRows(tabName);
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i][columnIndex];
      if (cell !== undefined && String(cell).trim() === String(value).trim()) {
        return i;
      }
    }
    return -1;
  }

  async batchGetRows(tabNames: string[]): Promise<Record<string, string[][]>> {
    if (tabNames.length === 0) return {};

    const ranges = tabNames.map((t) => `${escapeRangeComponent(t)}!A:ZZ`);
    const params = ranges
      .map((r) => `ranges=${encodeURIComponent(r)}`)
      .join("&");
    const url = `${SHEETS_API_BASE}/${this.spreadsheetId}/values:batchGet?${params}`;

    const res = await this.fetchWithRetry(
      url,
      { method: "GET" },
      tabNames.join(","),
      "batchGetRows",
    );

    const data = (await res.json()) as {
      valueRanges?: { values?: string[][] }[];
    };

    const result: Record<string, string[][]> = {};
    (data.valueRanges ?? []).forEach((vr, i) => {
      const name = tabNames[i];
      if (name) result[name] = vr.values ?? [];
    });
    return result;
  }
}
