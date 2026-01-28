import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateSupplyItem,
  useDisableSupplyItem,
  useEnableSupplyItem,
  useSupplyItems,
} from "../hooks/supplies.queries";

export default function SupplyItemsTab() {
  const [label, setLabel] = useState("");
  const [search, setSearch] = useState("");

  const itemsQ = useSupplyItems(search);
  const create = useCreateSupplyItem();
  const disable = useDisableSupplyItem();
  const enable = useEnableSupplyItem();

  const items =
    itemsQ.data?.items ??
    itemsQ.data?.data?.items ??
    itemsQ.data?.items?.items ??
    [];

  const add = async () => {
    if (!label.trim()) return;
    await create.mutateAsync({ label: label.trim(), unit: null });
    setLabel("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Nouvel article (ex: Rame A4)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-xs"
        />
        <Button onClick={add} disabled={create.isPending}>
          Ajouter
        </Button>

        <div className="flex-1" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[240px]"
        />
      </div>

      {itemsQ.isLoading && <div className="text-sm">Chargement...</div>}
      {itemsQ.isError && (
        <div className="text-sm text-red-600">
          {String(itemsQ.error.message)}
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs bg-muted/40">
          <div className="col-span-8 font-medium">Article</div>
          <div className="col-span-2 font-medium">Actif</div>
          <div className="col-span-2 font-medium text-right">Action</div>
        </div>

        {items.map((it: any) => (
          <div
            key={it._id}
            className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-t"
          >
            <div className="col-span-8">{it.label}</div>
            <div className="col-span-2">{String(it.active)}</div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => disable.mutate(it._id)}
                disabled={disable.isPending}
              >
                Désactiver
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => enable.mutate(it._id)}
                disabled={enable.isPending}
              >
                Activer
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
