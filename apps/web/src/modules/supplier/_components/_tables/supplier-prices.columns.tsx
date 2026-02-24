/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";

export type SupplierPriceRow = {
  id: string;
  supplierId: string;
  supplierName: string;
  itemId: string;
  itemLabel: string;
  unitPrice: number;
  updatedAt?: string;
};

export function buildSupplierPricesColumns(opts: {
  supplierLabels: Record<string, string>;
  itemLabels: Record<string, string>;
}): ColumnDef<SupplierPriceRow>[] {
  return [
    {
      id: "supplierId",
      accessorKey: "supplierId",
      header: "Fournisseur",
      meta: {
        label: "Fournisseur",
        filterVariant: "select",
        valueLabels: opts.supplierLabels,
        exportValue: (r: SupplierPriceRow) => r.supplierName,
      },
      cell: ({ row }) => (
        <span className="truncate">{row.original.supplierName}</span>
      ),
    },
    {
      id: "itemId",
      accessorKey: "itemId",
      header: "Article",
      meta: {
        label: "Article",
        filterVariant: "select",
        valueLabels: opts.itemLabels,
        exportValue: (r: SupplierPriceRow) => r.itemLabel,
      },
      cell: ({ row }) => (
        <span className="truncate">{row.original.itemLabel}</span>
      ),
    },
    {
      id: "unitPrice",
      accessorKey: "unitPrice",
      header: "Prix (XAF)",
      meta: {
        label: "Prix (XAF)",
        filterVariant: "range",
        exportValue: (r: SupplierPriceRow) => r.unitPrice,
      },
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.unitPrice.toLocaleString()} XAF
        </span>
      ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "MAJ",
      meta: {
        label: "MAJ",
        filterVariant: "date-range",
        exportValue: (r: SupplierPriceRow) =>
          r.updatedAt ? new Date(r.updatedAt).toISOString() : "",
      },
      cell: ({ row }) =>
        row.original.updatedAt ? (
          <span className="text-muted-foreground">
            {new Date(row.original.updatedAt).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];
}
