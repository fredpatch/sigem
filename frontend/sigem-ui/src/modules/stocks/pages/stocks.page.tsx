import { useEffect, useMemo, useState } from "react";
import {
  useStockList,
  useStockLocations,
  useStockMovements,
} from "../hooks/use-stock";
import { Loader2 } from "lucide-react";
import {
  TableComponent,
  TableToolbarConfig,
} from "@/components/shared/table/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { movementColumns } from "../_components/movement.columns";
import { stockColumns } from "../_components/stock.columns";
import { useStockContextStore } from "../store/use-stock-context.store";

export const StocksManagementPage = () => {
  const [locationId, setLocationId] = useState<string>("");
  const { setLocationId: setLocationIdStore } = useStockContextStore();

  const stockLocationsQ = useStockLocations();

  // bootstrap location
  useEffect(() => {
    if (stockLocationsQ.data?.length) {
      setLocationId(stockLocationsQ.data[0]._id);
      setLocationIdStore(stockLocationsQ.data[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, stockLocationsQ.data]);

  //   console.log("stockLocationsQ", locationId);

  const stockQ = useStockList({ locationId });
  const movQ = useStockMovements({ locationId, page: 1, limit: 25 });

  //   console.log("stockQ", stockQ.data);
  //   console.log("movQ", movQ.data);

  const stockToolbar: TableToolbarConfig = useMemo(
    () => ({
      tableId: "mg-stock-table",
      enableGlobalSearch: true,
      globalSearchPlaceholder: "Rechercher un article…",
      enableResetFilters: true,
      enableExport: true,
      export: { filename: "stocks.csv" },

      // filters on columns
      columnFilters: ["onHand"],

      presets: [
        {
          label: "Sous seuil",
          apply: (table) => {
            // filtre client-side: onHand <= minLevel
            // easiest: set global filter empty and filter via column filter "onHand range"
            // here we set a custom filter using columnFilters state? (simple: use global filter not good)
            // We'll do it with a preset that sorts and highlights later.
            // For now: sort by onHand asc
            table.setSorting([{ id: "onHand", desc: false }]);
          },
        },
      ],
    }),
    [locationId],
  );

  const movementsToolbar: TableToolbarConfig = useMemo(
    () => ({
      tableId: "mg-stock-movements",
      enableGlobalSearch: true,
      globalSearchPlaceholder: "Rechercher (motif, article, fournisseur)…",
      enableResetFilters: true,
      enableExport: true,
      export: { filename: "mouvements-stock.csv" },
      presets: [
        {
          label: "Entrées",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "IN" }]),
        },
        {
          label: "Sorties",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "OUT" }]),
          variant: "outline",
        },
        {
          label: "Ajustements",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "ADJUST" }]),
          variant: "secondary",
        },
      ],
    }),
    [],
  );

  if (stockLocationsQ.isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground flex justify-center items-center gap-2 h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
        Initialisation du magasin…
      </div>
    );
  }

  return (
    <div className="mx-auto p-4">
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <TableComponent
            items={stockQ.data?.items ?? []}
            columns={stockColumns}
            toolbar={stockToolbar}
            isLoading={stockQ.isLoading}
          />
        </TabsContent>

        <TabsContent value="movements">
          <TableComponent
            items={movQ.data?.items ?? []}
            columns={movementColumns}
            toolbar={movementsToolbar}
            isLoading={movQ.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
