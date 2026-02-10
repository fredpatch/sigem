// src/features/stock/_components/stock-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StockActionCell } from "./stock-action.table";
import TitleComponent from "@/components/shared/table/title.component";
import { Cog, Package, PackageCheck, TrendingDown } from "lucide-react";

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
    id: "label",
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
    cell: ({ row }) => (
      <div className="min-w-[220px] pl-6">
        <div className="font-medium">{row.original.supplyItemId?.label}</div>
      </div>
    ),
  },

  {
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
        <div className="min-w-[90px] flex justify-center items-center gap-2">
          <span className="font-semibold">{v}</span>
          {low && <Badge variant="secondary">Sous seuil</Badge>}
        </div>
      );
    },
  },
  {
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
