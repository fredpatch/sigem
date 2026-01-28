import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  SUPPLY_STATUS_LABEL_FR,
  SUPPLY_STATUS_VARIANT,
  toSupplyPlanStatus,
} from "../supply-status.fr";
import { SupplyPlanRow } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import { allowedNextStatuses } from "../hooks/supply-plan.transitions";
import {
  useAutoPricePlan,
  useChangePlanStatus,
} from "../hooks/supplies.queries";

export function buildSupplyPlanColumns(opts: {
  supplierSummary: (p: any) => string;
  onOpenPlan: (id: string) => void;
}): ColumnDef<SupplyPlanRow>[] {
  return [
    {
      id: "reference",
      accessorKey: "reference",
      header: "Référence",
      meta: { filterVariant: "text", label: "Référence" },
      cell: ({ row }) => {
        return (
          <span
            onClick={() => opts.onOpenPlan(row.original._id)}
            className="font-medium cursor-pointer hover:underline"
          >
            {row.original.reference}
          </span>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Statut",
      meta: {
        filterVariant: "select",
        label: "Statut",
        valueLabels: SUPPLY_STATUS_LABEL_FR as any,
        exportValue: (r) =>
          SUPPLY_STATUS_LABEL_FR[toSupplyPlanStatus(r.status)],
      },
      cell: ({ row }) => {
        const st = toSupplyPlanStatus(row.original.status);
        return (
          <Badge
            variant={SUPPLY_STATUS_VARIANT[st]}
            className="rounded-lg py-1"
          >
            {SUPPLY_STATUS_LABEL_FR[st]}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        row.original.createdAt ? (
          <span className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ) : (
          "—"
        ),
      // exportValue peut rester ISO si tu veux
      meta: {
        filterVariant: "date-range",
        label: "Date",
        exportValue: (r: any) =>
          r.createdAt ? new Date(r.createdAt).toISOString() : "",
      } as any,
    },
    {
      id: "supplier",
      header: "Fournisseur",
      accessorKey: "supplier",
      meta: { filterVariant: "text", label: "Fournisseur" },
      cell: ({ row }) => (
        <span>{opts.supplierSummary(row.original) || "—"}</span>
      ),
      // exportValue: pareil
    },
    {
      id: "total",
      header: "Total",
      accessorFn: (r) => r.estimatedTotal ?? 0,
      meta: {
        filterVariant: "range",
        label: "Total",
        exportValue: (r) => r.estimatedTotal ?? 0,
      },
      cell: ({ row }) => (
        <span className="font-medium">
          {(row.original.estimatedTotal ?? 0).toLocaleString()}{" "}
          {row.original.currency ?? "XAF"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const autoPrice = useAutoPricePlan();
        const changeStatus = useChangePlanStatus();

        const st = toSupplyPlanStatus(row.original.status);
        const next = allowedNextStatuses(st);

        return (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => autoPrice.mutate(row.original._id)}
              disabled={autoPrice.isPending}
            >
              <Sparkles className="h-4 w-4 mr-0 text-yellow-600" />
              Prix auto
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Statut <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {next.map((nx) => (
                  <DropdownMenuItem
                    key={nx}
                    onClick={() =>
                      changeStatus.mutate({ id: row.original._id, to: nx })
                    }
                  >
                    {SUPPLY_STATUS_LABEL_FR[nx]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
