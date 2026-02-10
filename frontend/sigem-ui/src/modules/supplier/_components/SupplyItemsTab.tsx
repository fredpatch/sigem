import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSupplyItem, useSupplyItems } from "../hooks/supplies.queries";
import { buildSupplyItemsColumns } from "./_tables/supply-items.columns";
import {
  TableComponent,
  TableToolbarConfig,
} from "@/components/shared/table/table";
import { Plus } from "lucide-react";

export default function SupplyItemsTab() {
  const [label, setLabel] = useState("");
  const itemsQ = useSupplyItems({ active: true, limit: 200 });
  const create = useCreateSupplyItem();

  const items =
    itemsQ.data?.items ??
    itemsQ.data?.data?.items ??
    itemsQ.data?.items?.items ??
    [];

  const columns = useMemo(() => buildSupplyItemsColumns(), []);

  const toolbar: TableToolbarConfig = {
    tableId: "supplies:items",
    enableGlobalSearch: true,
    globalSearchPlaceholder: "Rechercher un article...",
    enableResetFilters: true,
    columnFilters: ["updatedAt"],

    enableExport: true,
    export: {
      formats: ["csv", "xlsx", "pdf"],
      filename: "articles-fournitures",
    },

    // presets: [
    //   {
    //     label: "Actifs",
    //     apply: (table) => {
    //       table.resetColumnFilters();
    //       table.getColumn("active")?.setFilterValue("active");
    //     },
    //   },
    //   {
    //     label: "Inactifs",
    //     apply: (table) => {
    //       table.resetColumnFilters();
    //       table.getColumn("active")?.setFilterValue("inactive");
    //     },
    //   },
    //   {
    //     label: "Tout",
    //     apply: (table) => {
    //       table.resetColumnFilters();
    //       table.setGlobalFilter("");
    //     },
    //   },
    // ],
  };

  const add = async () => {
    if (!label.trim()) return;
    await create.mutateAsync({ label: label.trim(), unit: null });
    setLabel("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Nouvel article (ex: Rame A4)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-[280px]"
        />
        <Button onClick={add} disabled={create.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <TableComponent
        items={items}
        columns={columns as any}
        toolbar={toolbar}
        isLoading={itemsQ.isLoading}
        emptyState={
          <div className="text-sm text-muted-foreground">Aucun article.</div>
        }
      />
    </div>
  );
}
