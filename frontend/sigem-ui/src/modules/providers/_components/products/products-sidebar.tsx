// products-sidebar.tsx
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/use-purchasing";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";

const TYPE_TABS = [
  { value: "ALL", label: "Tous" },
  { value: "CONSUMABLE", label: "Consommables" },
  { value: "MOBILIER", label: "Mobilier" },
  { value: "EQUIPEMENT", label: "Équipement" },
] as const;

export function ProductsSidebar() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const type = sp.get("type") ?? "ALL";

  const params = useMemo(() => {
    const p: any = { page: 1, limit: 50 };
    if (q.trim()) p.q = q.trim();
    if (type !== "ALL") p.type = type;
    return p;
  }, [q, type]);

  const { data, isLoading } = useProducts(params);
  const items = data?.items ?? [];

  const { openModal } = useModalStore();

  const onAdd = () => openModal(ModalTypes.PRODUCT_FORM);

  const onSelect = (id: string) => nav(`/products/${id}`);

  return (
    <div className="space-y-3">
      <Button onClick={onAdd} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Ajouter un produit
      </Button>

      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            setSp((prev) => {
              const next = new URLSearchParams(prev);
              if (v.trim()) next.set("q", v.trim());
              else next.delete("q");
              return next;
            });
          }}
          className="pl-9"
          placeholder="Rechercher (label, code...)"
        />
      </div>

      <Tabs
        value={type}
        onValueChange={(v) => {
          setSp((prev) => {
            const next = new URLSearchParams(prev);
            if (v === "ALL") next.delete("type");
            else next.set("type", v);
            return next;
          });
        }}
      >
        <TabsList className="w-full justify-start overflow-auto">
          {TYPE_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="max-h-[55vh] overflow-auto rounded-md border bg-background">
        {isLoading ? (
          <div className="p-3 text-sm text-muted-foreground">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="divide-y">
            {items.map((p: any) => (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-muted/40 transition"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{p.label}</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {p.code}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {p.type} {p.unit ? `• ${p.unit}` : ""}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
