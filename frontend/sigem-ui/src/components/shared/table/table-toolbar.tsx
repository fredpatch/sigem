import { Input } from "@/components/ui/input";
import { Filter, TableToolbarConfig } from "./table";
import { Button } from "@/components/ui/button";
import { ExportControls } from "../export-control";
import { RefreshCcw } from "lucide-react";

type Props = {
  table: any;
  config?: TableToolbarConfig;
};

export function TableToolbar({ table, config }: Props) {
  if (!config) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* LEFT */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Global search */}
        {config.enableGlobalSearch && (
          <Input
            value={table.getState().globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder={config.globalSearchPlaceholder ?? "Rechercher..."}
            className="w-[260px]"
          />
        )}

        {/* Column filters */}
        {config.columnFilters?.map((key) => {
          const col = table.getColumn(key);
          if (!col) return null;
          return <Filter key={key} column={col} />;
        })}

        {/* Presets */}
        {config.presets?.map((p) => (
          <Button
            key={p.label}
            variant={p.variant ?? "default"}
            size="sm"
            onClick={() => p.apply(table)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {config.enableResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              table.resetGlobalFilter();
            }}
          >
            <RefreshCcw />
          </Button>
        )}
        {/* Réinitialiser */}

        {/* Export Dropdown */}
        {config.enableExport && (
          <ExportControls table={table} config={config} />
        )}

        {/* Importer */}
        {config.actions?.map((a) => (
          <Button
            key={a.key}
            variant={a.variant ?? "default"}
            size={a.size ?? "sm"}
            onClick={a.onClick}
            disabled={a.disabled}
            className="gap-2"
          >
            {a.icon}
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
