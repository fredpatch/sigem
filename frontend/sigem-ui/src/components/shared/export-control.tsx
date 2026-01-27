import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  buildExportMatrix,
  exportMatrixToCsv,
  exportToXlsxExcelJS,
  getColumnLabel,
  getExportableColumns,
  loadSelected,
  saveSelected,
} from "@/utils/export";
import { exportToPdf } from "@/utils/pdf/export-pdf";

function makeDefaultFilename(base?: string) {
  const d = new Date();
  const stamp = d.toISOString().slice(0, 10);
  return base ? `${base}-${stamp}` : `export-${stamp}`;
}

export function ExportControls({ table, config }: { table: any; config: any }) {
  const tableId = config?.tableId;
  const formats = config?.export?.formats ?? ["csv"];
  const enableColumnPicker = config?.export?.enableColumnPicker ?? true;

  const exportableCols = useMemo(() => getExportableColumns(table), [table]);

  const [selectedColIds, setSelectedColIds] = useState<string[]>(() => {
    const saved = loadSelected(tableId);
    if (saved?.length) return saved;
    return exportableCols.map((c: any) => c.id); // défaut: toutes visibles exportables
  });

  // sync si colonnes changent (ex: hide/show)
  useEffect(() => {
    const available = new Set(exportableCols.map((c: any) => c.id));
    setSelectedColIds((prev) => {
      const next = prev.filter((id) => available.has(id));
      if (next.length === 0) return exportableCols.map((c: any) => c.id);
      return next;
    });
  }, [exportableCols]);

  const updateCols = (next: string[]) => {
    setSelectedColIds(next);
    saveSelected(tableId, next);
  };

  const doExport = (
    scope: "view" | "selected" | "all",
    format: "csv" | "xlsx" | "pdf",
  ) => {
    const rows =
      scope === "view"
        ? table.getSortedRowModel().rows
        : scope === "selected"
          ? table.getSelectedRowModel().rows
          : table.getCoreRowModel().rows;

    const { headers, body } = buildExportMatrix(table, rows, selectedColIds);

    const base = makeDefaultFilename(config?.export?.filename);

    if (format === "xlsx") return exportToXlsxExcelJS(base, headers, body);
    if (format === "pdf")
      return exportToPdf(
        base,
        headers,
        body,
        config?.export?.filename ?? "Export",
      );
    // csv fallback
    if (format === "csv") {
      return exportMatrixToCsv(`${base}.csv`, headers, body);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {enableColumnPicker && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="tertiary" size="sm">
              <Columns3 className="h-4 w-4 mr-2" />
              Colonnes
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="max-h-[360px] overflow-auto"
          >
            <DropdownMenuLabel>Colonnes à exporter</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => updateCols(exportableCols.map((c: any) => c.id))}
            >
              Tout sélectionner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateCols([])}>
              Tout désélectionner
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {exportableCols.map((c: any) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={selectedColIds.includes(c.id)}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? Array.from(new Set([...selectedColIds, c.id]))
                    : selectedColIds.filter((id) => id !== c.id);
                  updateCols(next);
                }}
              >
                {getColumnLabel(c)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Vue courante</DropdownMenuLabel>
          {formats.map((f: any) => (
            <DropdownMenuItem
              key={`view-${f}`}
              onClick={() => doExport("view", f)}
            >
              {`Exporter ( ${f.toUpperCase()} )`}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>
            Sélection ({table.getSelectedRowModel().rows.length})
          </DropdownMenuLabel>
          {formats.map((f: any) => (
            <DropdownMenuItem
              key={`sel-${f}`}
              disabled={table.getSelectedRowModel().rows.length === 0}
              onClick={() => doExport("selected", f)}
            >
              {`Exporter sélection ( ${f.toUpperCase()} )`}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Tout</DropdownMenuLabel>
          {formats.map((f: any) => (
            <DropdownMenuItem
              key={`all-${f}`}
              onClick={() => doExport("all", f)}
            >
              {`Exporter tout ( ${f.toUpperCase()} )`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
