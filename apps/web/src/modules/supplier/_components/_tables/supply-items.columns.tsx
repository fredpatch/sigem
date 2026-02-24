/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDisableSupplyItem,
  useEnableSupplyItem,
} from "../../hooks/supplies.queries";

export type SupplyItemRow = {
  _id: string;
  label: string;
  unit?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function buildSupplyItemsColumns(): ColumnDef<SupplyItemRow>[] {
  return [
    {
      id: "label",
      accessorKey: "label",
      header: "Article",
      meta: {
        label: "Article",
        filterVariant: "text",
        placeholder: "Rame A4, Eau...",
        exportValue: (r: SupplyItemRow) => r.label,
      },
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{row.original.label}</div>
          {row.original.unit ? (
            <div className="text-xs text-muted-foreground truncate">
              Unité : {row.original.unit}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "active",
      accessorKey: "active",
      header: "Statut",
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue || filterValue === "all") return true;
        const v = Boolean(row.getValue(columnId));
        return filterValue === "active" ? v : !v;
      },
      meta: {
        label: "Statut",
        filterVariant: "select",
        valueLabels: {
          all: "Tous",
          active: "Actifs",
          inactive: "Inactifs",
        },
        exportValue: (r: SupplyItemRow) => (r.active ? "Actif" : "Inactif"),
      },
      cell: ({ row }) =>
        row.original.active ? (
          <Badge variant="active" className="rounded-lg">
            Actif
          </Badge>
        ) : (
          <Badge variant="secondary" className="rounded-lg">
            Inactif
          </Badge>
        ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "MAJ",
      meta: {
        label: "Mise à jour",
        filterVariant: "date-range",
        exportValue: (r: SupplyItemRow) =>
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isActive = row.original.active;
        const enable = useEnableSupplyItem();
        const disable = useDisableSupplyItem();

        return (
          <div className="flex justify-end gap-2">
            {isActive ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => disable.mutate(row.original._id)}
                disabled={disable.isPending}
              >
                Désactiver
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => enable.mutate(row.original._id)}
                disabled={enable.isPending}
              >
                Activer
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
