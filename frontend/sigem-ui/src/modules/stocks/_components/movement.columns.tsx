// src/features/stock/_components/movement-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatPrice } from "./stock-sidebar";

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
    size: 100,
    minSize: 120,
    maxSize: 140,
    meta: {
      filterVariant: "select",
      label: "Type",
      valueLabels: { IN: "Entrée", OUT: "Sortie", ADJUST: "Ajust." },
      exportValue: (r) => r.type,
    },
    cell: ({ row }) => {
      const t = row.original.type;
      return (
        <div className="flex items-center justify-center">
          <Badge
            variant={
              t === "IN" ? "secondary" : t === "OUT" ? "destructive" : "quote"
            }
          >
            {movementTypeLabel(t)}
          </Badge>
        </div>
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
    size: 60,
    minSize: 90,
    maxSize: 100,
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
    size: 140,
    minSize: 140,
    maxSize: 160,
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
    size: 140,
    minSize: 140,
    maxSize: 160,
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
    size: 90,
    minSize: 90,
    maxSize: 100,
    meta: { filterVariant: "range", label: "Prix unitaire" },
    cell: ({ row }) => {
      const v = row.original.unitCost ?? 0;

      return (
        <div className="min-w-[90px] flex justify-center">
          {formatPrice(v) ?? "-"}
        </div>
      );
    },
  },
  {
    id: "reason",
    header: "Motif",
    accessorKey: "reason",
    size: 250,
    minSize: 200,
    maxSize: 350,
    meta: { filterVariant: "text", label: "Motif" },
    cell: ({ row }) => (
      <div className="whitespace-pre-wrap wrap-break-words max-w-xs">
        {row.original.reason ?? "-"}
      </div>
    ),
  },
];
