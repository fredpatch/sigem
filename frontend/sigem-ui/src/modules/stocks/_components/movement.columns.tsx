// src/features/stock/_components/movement-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type MovementRow = {
  _id: string;
  createdAt: string;
  type: "IN" | "OUT" | "ADJUST";
  delta: number;
  stockBefore: number;
  stockAfter: number;
  reason?: string;
  unitCost?: number;
  supplyItemId?: { _id: string; label: string; unit: string };
  providerId?: { _id: string; name?: string; label?: string };
};

function movementTypeLabel(type: MovementRow["type"]) {
  if (type === "IN") return "Entrée";
  if (type === "OUT") return "Sortie";
  return "Ajustement";
}

export const movementColumns: ColumnDef<MovementRow>[] = [
  {
    id: "createdAt",
    header: "Date",
    accessorFn: (r) => r.createdAt,
    meta: { filterVariant: "date-range", label: "Date" },
    cell: ({ row }) => (
      <div className="min-w-[160px] flex items-center justify-center gap-1">
        {format(new Date(row.original.createdAt), "PP HH:mm", { locale: fr })}
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    meta: {
      filterVariant: "select",
      label: "Type",
      valueLabels: { IN: "Entrée", OUT: "Sortie", ADJUST: "Ajust." },
      exportValue: (r) => r.type,
    },
    cell: ({ row }) => {
      const t = row.original.type;
      return (
        <Badge
          variant={
            t === "IN" ? "default" : t === "OUT" ? "secondary" : "outline"
          }
        >
          {movementTypeLabel(t)}
        </Badge>
      );
    },
  },
  {
    id: "item",
    header: "Article",
    accessorFn: (r) => r.supplyItemId?.label ?? "",
    meta: { filterVariant: "text", label: "Article" },
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <div className="font-medium">
          {row.original.supplyItemId?.label ?? "-"}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.supplyItemId?.unit ?? ""}
        </div>
      </div>
    ),
  },
  {
    id: "delta",
    header: "Delta",
    accessorKey: "delta",
    meta: { filterVariant: "range", label: "Delta" },
    cell: ({ row }) => (
      <div className="min-w-[70px] flex justify-center font-semibold">
        {row.original.delta}
      </div>
    ),
  },
  {
    id: "beforeAfter",
    header: "Avant → Après",
    accessorFn: (r) => `${r.stockBefore} -> ${r.stockAfter}`,
    meta: { label: "Avant/Après" },
    cell: ({ row }) => (
      <div className="min-w-[140px] flex justify-center gap-1">
        {row.original.stockBefore} →{" "}
        <span className="font-semibold">{row.original.stockAfter}</span>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Fournisseur",
    accessorFn: (r) => r.providerId?.name ?? r.providerId?.label ?? "",
    meta: { filterVariant: "text", label: "Fournisseur" },
    cell: ({ row }) => (
      <div className="min-w-[140px] flex justify-center">
        {row.original.providerId?.name ?? row.original.providerId?.label ?? "-"}
      </div>
    ),
  },
  {
    id: "unitCost",
    header: "PU",
    accessorKey: "unitCost",
    meta: { filterVariant: "range", label: "Prix unitaire" },
    cell: ({ row }) => (
      <div className="min-w-[90px] flex justify-center">
        {row.original.unitCost ?? "-"}
      </div>
    ),
  },
  {
    id: "reason",
    header: "Motif",
    accessorKey: "reason",
    meta: { filterVariant: "text", label: "Motif" },
    cell: ({ row }) => (
      <div className="min-w-[200px]">{row.original.reason ?? "-"}</div>
    ),
  },
];
