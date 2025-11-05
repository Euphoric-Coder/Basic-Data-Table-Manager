import Papa from "papaparse";
import { saveAs } from "file-saver";
import type { ColumnDef, RowData } from "@/types";

/** Parse CSV text -> { columns, rows } */
export function parseCsv(text: string): {
  columns: ColumnDef[];
  rows: RowData[];
} {
  const parsed = Papa.parse<string[]>(text.trim(), { header: false });
  if (parsed.errors.length)
    throw new Error(parsed.errors.map((e) => e.message).join("; "));

  const rows = parsed.data as unknown as string[][];
  if (!rows.length) throw new Error("Empty CSV");

  const headers = rows[0].map((h) => (h || "").trim());
  if (!headers.length) throw new Error("No headers detected");

  const columns: ColumnDef[] = headers.map((h, i) => ({
    key: toKey(h),
    label: h || `Column ${i + 1}`,
    type: guessTypeFromHeader(h),
    visible: true,
    order: i,
  }));

  const body = rows.slice(1);
  const data: RowData[] = body.map((r) => {
    const obj: RowData = { id: cryptoRandomId() };
    headers.forEach((h, i) => {
      const key = toKey(h);
      const raw = r[i] ?? "";
      const col = columns[i];
      (obj as any)[key] = col.type === "number" ? toNumberOrZero(raw) : raw;
    });
    return obj;
  });

  return { columns, rows: data };
}

export function exportCsv(visibleCols: ColumnDef[], rows: RowData[]) {
  const headers = visibleCols.map((c) => c.label);
  const body = rows.map((r) =>
    visibleCols.map((c) => (r[c.key] ?? "").toString())
  );
  const csv = Papa.unparse([headers, ...body], { quotes: true });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `table-export-${Date.now()}.csv`);
}

function toKey(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}
function guessTypeFromHeader(h: string): "text" | "number" | "email" {
  const L = h.toLowerCase();
  if (L.includes("age") || L.includes("count") || L.includes("num"))
    return "number";
  if (L.includes("email") || L.includes("mail")) return "email";
  return "text";
}
function toNumberOrZero(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
