// src/features/stock/_components/stock-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StockActionCell } from "./stock-action.table";
import TitleComponent from "@/components/shared/table/title.component";
import { Cog, Package, PackageCheck, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StockRow = {
  _id: string;
  onHand: number;
  minLevel: number;
  supplyItemId: {
    _id: string;
    label: string;
    unit: string;
  };
};

export const stockColumns: ColumnDef<StockRow>[] = [
  {
    enableResizing: true,
    id: "label",
    size: 260,
    minSize: 180,
    maxSize: 280,
    header: () => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-green-500" />
        <TitleComponent className="flex justify-end" label="Article" />
      </div>
    ),
    accessorFn: (row) => row.supplyItemId?.label ?? "",
    meta: {
      filterVariant: "text",
      label: "Article",
      exportValue: (row) => row.supplyItemId?.label ?? "",
    },
    cell: ({ row }) => {
      return (
        <div className="pl-6 w-full">
          <div className="font-medium">{row.original.supplyItemId?.label}</div>
        </div>
      );
    },
  },

  {
    size: 160,
    minSize: 120,
    maxSize: 240,
    id: "onHand",
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <PackageCheck className="h-4 w-4 text-purple-500" />
        <TitleComponent className="flex justify-end" label="Disponible" />
      </div>
    ),
    accessorKey: "onHand",
    meta: {
      filterVariant: "range",
      label: "Disponible",
      exportValue: (row) => row.onHand,
    },
    cell: ({ row }) => {
      const v = row.original.onHand ?? 0;
      const min = row.original.minLevel ?? 0;
      const low = v <= min;
      return (
        <div className="flex justify-center items-center gap-2">
          <span className={cn("font-semibold", { "text-red-700": low })}>
            {v}
          </span>
          {low && (
            <Badge
              variant="default"
              className="bg-orange-200 text-orange-700 border border-orange-800"
            >
              Sous seuil
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    size: 160,
    minSize: 120,
    maxSize: 240,
    id: "minLevel",
    header: () => (
      <div className="flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-red-400" />
        <TitleComponent className="flex justify-end" label="Seuil minimum" />
      </div>
    ),
    accessorKey: "minLevel",
    meta: {
      filterVariant: "range",
      label: "Seuil",
      exportValue: (row) => row.minLevel,
    },
    cell: ({ row }) => (
      <div className="min-w-[90px] flex justify-center">
        {row.original.minLevel ?? 0}
      </div>
    ),
  },
  {
    id: "belowMin",
    header: "Sous seuil",
    accessorFn: (row) => {
      const onHand = Number(row.onHand ?? 0);
      const min = Number(row.minLevel ?? 0);
      return onHand <= min;
    },
    // option: cacher cette colonne dans l'UI si tu ne veux pas l'afficher
    enableHiding: true,
    enableSorting: false,
    filterFn: (row, columnId, filterValue) => {
      // filterValue = true/false
      const v = row.getValue<boolean>(columnId);
      return filterValue === "all" ? true : v === filterValue;
    },
    cell: () => null, // 👈 pas besoin d'afficher
  },
  {
    size: 180,
    minSize: 160,
    maxSize: 240,
    id: "actions",
    header: () => (
      <div className="flex items-center justify-end gap-2">
        <Cog className="h-4 w-4 text-green-500" />
        <TitleComponent className="flex justify-end" label="Actions" />
      </div>
    ),
    cell: ({ row }) => <StockActionCell row={row} />,
  },
];
