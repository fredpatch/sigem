import * as XLSX from "xlsx";
import Papa from "papaparse";

export type ParsedTable = { headers: string[]; rows: Record<string, any>[] };

export function parseTabularFile(
  buffer: Buffer,
  filename: string,
): ParsedTable {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".csv")) {
    const text = buffer.toString("utf8");
    const res = Papa.parse<Record<string, any>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    const rows = (res.data ?? []).filter(Boolean);
    const headers = res.meta.fields ?? Object.keys(rows[0] ?? {});
    return { headers, rows };
  }

  // default xlsx
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });
  const headers = Object.keys(rows[0] ?? {});
  return { headers, rows };
}
