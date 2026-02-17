import { useEffect, useMemo, useState } from "react";
import {
  useStockList,
  useStockLocations,
  useStockMovements,
} from "../hooks/use-stock";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  TableComponent,
  TableToolbarConfig,
} from "@/components/shared/table/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { movementColumns } from "../_components/movement.columns";
import { stockColumns } from "../_components/stock.columns";
import { useStockContextStore } from "../store/use-stock-context.store";
import { ModalTypes } from "@/types/modal.types";
import { useModalStore } from "@/stores/modal-store";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const StocksManagementPage = () => {
  const [locationId, setLocationId] = useState<string>("");
  const { setLocationId: setLocationIdStore } = useStockContextStore();
  const { openModal } = useModalStore();

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

  const open = (mode: "IN" | "OUT" | "ADJUST") => {
    if (!locationId) return;
    openModal(ModalTypes.STOCK_MOVEMENT_FORM, { mode, locationId });
  };
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
          variant: "destructive",
          label: "Sous seuil",
          apply: (table) => {
            table.setColumnFilters([{ id: "belowMin", value: true }]);
            table.setSorting([{ id: "onHand", desc: false }]);
          },
        },
        {
          variant: "outline",
          label: "Tous",
          apply: (table) => {
            table.resetColumnFilters();
            table.resetGlobalFilter();
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
          variant: "secondary",
          label: "Entrées",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "IN" }]),
        },
        {
          label: "Sorties",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "OUT" }]),
          variant: "destructive",
        },
        {
          label: "Ajustements",
          apply: (table) =>
            table.setColumnFilters([{ id: "type", value: "ADJUST" }]),
          variant: "default",
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
        <div className="flex gap-2">
          <TabsList>
            <>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="movements">Mouvements</TabsTrigger>
            </>
          </TabsList>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => open("IN")}
                className="ml-2 w-full justify-start gap-2 h-8.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <ArrowDownToLine className="h-4 w-4" />
                <span>Entrée</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => open("OUT")}
                className="w-full justify-start gap-2 h-8.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                <span>Sortie</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="quote"
                onClick={() => open("ADJUST")}
                className="w-full justify-start gap-2 h-8.5 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900 dark:hover:bg-blue-950"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Ajustement inventaire</span>
              </Button>
            </motion.div>
          </div>
        </div>

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
