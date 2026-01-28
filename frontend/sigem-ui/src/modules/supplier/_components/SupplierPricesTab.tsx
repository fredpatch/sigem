import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSupplyItems,
  useSupplierPrices,
  useUpsertSupplierPrice,
} from "../hooks/supplies.queries";
import { ProviderSelect } from "../_components/ProviderSelect";
import { useSuppliesLookups } from "../hooks/use-supplies-lookups";
import { SupplierPriceRow } from "../types";
import {
  TableComponent,
  TableToolbarConfig,
} from "@/components/shared/table/table";
import { buildSupplierPricesColumns } from "./_tables/supplier-prices.columns";
import { Save } from "lucide-react";
import { ItemSelect } from "./ItemSelect";

export default function SupplierPricesTab() {
  const itemsQ = useSupplyItems("");
  const pricesQ = useSupplierPrices();
  const upsert = useUpsertSupplierPrice();
  const { itemMap, providerMap } = useSuppliesLookups();

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [itemId, setItemId] = useState("");
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const items =
    itemsQ.data?.items ??
    itemsQ.data?.data?.items ??
    itemsQ.data?.items?.items ??
    [];
  const prices =
    pricesQ.data?.items ??
    pricesQ.data?.data?.items ??
    pricesQ.data?.items?.items ??
    [];

  const save = async () => {
    if (!supplierId || !itemId) return;
    await upsert.mutateAsync({
      supplierId,
      itemId,
      unitPrice: Number(unitPrice),
      source: { note: "UI test" },
    });
  };

  const rows: SupplierPriceRow[] = useMemo(() => {
    return (prices ?? []).map((p: any) => {
      const provider = providerMap.get(String(p.supplierId));
      const item = itemMap.get(String(p.itemId));

      return {
        id: String(p._id),
        supplierId: String(p.supplierId),
        supplierName: provider?.name ?? String(p.supplierId),
        itemId: String(p.itemId),
        itemLabel: item?.label ?? String(p.itemId),
        unitPrice: Number(p.unitPrice ?? 0),
        updatedAt: p.updatedAt,
      };
    });
  }, [prices, providerMap, itemMap]);

  const supplierLabels = useMemo(() => {
    const obj: Record<string, string> = {};
    providerMap.forEach(
      (p: any, id: string) => (obj[String(id)] = p?.name ?? String(id)),
    );
    return obj;
  }, [providerMap]);

  const itemLabels = useMemo(() => {
    const obj: Record<string, string> = {};
    itemMap.forEach(
      (it: any, id: string) => (obj[String(id)] = it?.label ?? String(id)),
    );
    return obj;
  }, [itemMap]);

  const toolbarConfig: TableToolbarConfig = {
    tableId: "supplies:supplier-prices",
    enableGlobalSearch: true,
    globalSearchPlaceholder: "Rechercher (fournisseur, article...)",
    enableResetFilters: true,
    columnFilters: ["unitPrice", "updatedAt"],
    enableExport: true,
    export: {
      formats: ["csv", "xlsx", "pdf"],
      filename: "prix-fournisseurs",
      enableColumnPicker: true,
    },
    // presets: [
    //   {
    //     label: "MAJ 7 jours",
    //     apply: (table) => {
    //       table.resetColumnFilters();
    //       const from = new Date(
    //         Date.now() - 7 * 24 * 3600 * 1000,
    //       ).toISOString();
    //       const to = new Date().toISOString();
    //       table.getColumn("updatedAt")?.setFilterValue([from, to]);
    //     },
    //   },
    //   {
    //     label: "MAJ 30 jours",
    //     apply: (table) => {
    //       table.resetColumnFilters();
    //       const from = new Date(
    //         Date.now() - 30 * 24 * 3600 * 1000,
    //       ).toISOString();
    //       const to = new Date().toISOString();
    //       table.getColumn("updatedAt")?.setFilterValue([from, to]);
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

  const onPickRow = (r: any) => {
    setSupplierId(r.supplierId);
    setItemId(r.itemId);
    setUnitPrice(r.unitPrice);
  };

  const columns = useMemo(
    () => buildSupplierPricesColumns({ supplierLabels, itemLabels }),
    [supplierLabels, itemLabels],
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-4">
          <ProviderSelect
            value={supplierId}
            onChange={setSupplierId}
            placeholder="Choisir un fournisseur"
            onlyType="FOURNISSEUR"
          />
        </div>

        <div className="col-span-4">
          <ItemSelect
            items={items}
            value={itemId || undefined}
            onChange={(id) => setItemId(id)}
            disabled={itemsQ.isLoading}
          />
        </div>

        <div className="col-span-2">
          <Input
            type="number"
            min={0}
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
          />
        </div>

        <div className="col-span-2 flex justify-end">
          <Button
            onClick={save}
            disabled={upsert.isPending || !supplierId || !itemId}
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <TableComponent
        items={rows}
        columns={columns as any}
        toolbar={toolbarConfig}
        isLoading={pricesQ.isLoading}
        emptyState={
          <div className="text-sm text-muted-foreground">
            Aucun prix fournisseur.
          </div>
        }
        onRowClick={onPickRow}
      />
    </div>
  );
}
