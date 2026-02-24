import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsvValue(v: any) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, `""`)}"`;
}

type ExportColumn<T> = {
  id: string;
  label: string;
  getValue: (row: T) => any;
};

export function exportRowsToCsv<T>(
  filename: string,
  rows: T[],
  cols: ExportColumn<T>[],
) {
  const header = cols.map((c) => toCsvValue(c.label)).join(",");
  const body = rows
    .map((r) => cols.map((c) => toCsvValue(c.getValue(r))).join(","))
    .join("\n");

  const csv = [header, body].join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

export function exportMatrixToCsv(
  filename: string,
  headers: string[],
  body: any[][],
) {
  const escape = (v: any) =>
    `"${String(v ?? "")
      .replace(/"/g, `""`)
      .replace(/\r?\n|\r/g, " ")}"`;

  const csv =
    headers.map(escape).join(",") +
    "\n" +
    body.map((row) => row.map(escape).join(",")).join("\n");

  // ✅ BOM for Excel / accents
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildExportColumnsFromTableRows<TData>(
  table: any,
): ExportColumn<any>[] {
  const cols = table
    .getAllLeafColumns()
    .filter((c: any) => c.getIsVisible())
    .filter((c: any) => !["select", "actions"].includes(c.id));

  return cols.map((c: any) => {
    const meta = c.columnDef?.meta ?? {};
    const label =
      meta.label ??
      (typeof c.columnDef?.header === "string" ? c.columnDef.header : c.id);

    return {
      id: c.id,
      label,
      getValue: (tableRow: any) => {
        const original = tableRow.original as TData;
        if (typeof meta.exportValue === "function") {
          return meta.exportValue(original);
        }
        return tableRow.getValue(c.id);
      },
    };
  });
}

export function getExportableColumns(table: any) {
  return table
    .getAllLeafColumns()
    .filter((c: any) => c.getIsVisible())
    .filter((c: any) => !["select", "actions"].includes(c.id));
}

export function getColumnLabel(c: any) {
  const meta = c.columnDef?.meta ?? {};
  return (
    meta.label ??
    (typeof c.columnDef?.header === "string" ? c.columnDef.header : c.id)
  );
}

export function loadSelected(tableId?: string) {
  if (!tableId) return null;
  try {
    const raw = localStorage.getItem(`table-export-cols:${tableId}`);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function saveSelected(tableId: string | undefined, ids: string[]) {
  if (!tableId) return;
  localStorage.setItem(`table-export-cols:${tableId}`, JSON.stringify(ids));
}

export function exportToPdf(
  filename: string,
  headers: string[],
  body: any[][],
  title?: string,
) {
  // paysage si beaucoup de colonnes
  const doc = new jsPDF({
    orientation: headers.length > 6 ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const safeTitle = title ?? "Export";
  doc.setFontSize(14);
  doc.text(safeTitle, 40, 40);

  autoTable(doc, {
    head: [headers],
    body,
    startY: 60,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fontSize: 9 },
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export async function exportToXlsxExcelJS(
  filenameBase: string,
  headers: string[],
  body: any[][],
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Export");

  ws.addRow(headers);
  body.forEach((row) => ws.addRow(row.map((v) => v ?? "")));

  // Optionnel: rendre l'en-tête un peu mieux
  ws.getRow(1).font = { bold: true };

  // Auto width basique
  ws.columns = headers.map((h, idx) => {
    const maxLen = Math.max(
      h.length,
      ...body.map((r) => String(r[idx] ?? "").length),
    );
    return { width: Math.min(Math.max(maxLen + 2, 12), 40) };
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = filenameBase.endsWith(".xlsx")
    ? filenameBase
    : `${filenameBase}.xlsx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildExportMatrix(
  table: any,
  rows: any[],
  selectedColumnIds?: string[],
) {
  const colsAll = getExportableColumns(table);

  const cols = selectedColumnIds?.length
    ? colsAll.filter((c: any) => selectedColumnIds.includes(c.id))
    : colsAll;

  const headers = cols.map((c: any) => getColumnLabel(c));

  const body = rows.map((r: any) =>
    cols.map((c: any) => {
      const meta = c.columnDef?.meta ?? {};
      if (typeof meta.exportValue === "function") {
        return meta.exportValue(r.original);
      }
      return r.getValue(c.id);
    }),
  );

  return { headers, body, cols };
}
