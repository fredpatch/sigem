import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSupplyItems,
  useSupplierPrices,
  useUpsertSupplierPrice,
} from "../hooks/supplies.queries";
import { ProviderSelect } from "../_components/ProviderSelect";
import { useSuppliesLookups } from "../hooks/use-supplies-lookups";

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
          <select
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Choisir article</option>
            {items.map((it: any) => (
              <option key={it._id} value={it._id}>
                {it.label}
              </option>
            ))}
          </select>
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
            Upsert
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs bg-muted/40">
          <div className="col-span-4 font-medium">Fournisseur</div>
          <div className="col-span-4 font-medium">Article</div>
          <div className="col-span-2 font-medium">Prix</div>
          <div className="col-span-2 font-medium">MAJ</div>
        </div>

        {prices.map((p: any) => {
          const provider = providerMap.get(String(p.supplierId));
          const item = itemMap.get(String(p.itemId));

          return (
            <div
              key={p._id}
              className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-t"
            >
              <div className="col-span-4 truncate">
                {provider ? provider.name : String(p.supplierId)}
              </div>

              <div className="col-span-4 truncate">
                {item ? item.label : String(p.itemId)}
              </div>

              <div className="col-span-2 font-medium">{p.unitPrice} XAF</div>

              <div className="col-span-2 text-muted-foreground">
                {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "-"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
