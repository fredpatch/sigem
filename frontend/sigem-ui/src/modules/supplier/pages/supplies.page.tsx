import { useMemo, useState } from "react";
import {
  useAutoPricePlan,
  useChangePlanStatus,
  useCreateSupplyPlan,
  useSupplyPlan,
  useSupplyPlans,
} from "../hooks/supplies.queries";
import PlanDrawer from "../_components/PlanDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import SupplyItemsTab from "../_components/SupplyItemsTab";
import SupplierPricesTab from "../_components/SupplierPricesTab";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProvidersList } from "@/modules/providers/hooks/use-providers";
import { Guidelines } from "@/common/guidelines";
import {
  SUPPLY_STATUS_LABEL_FR,
  SUPPLY_STATUS_VARIANT,
  toSupplyPlanStatus,
} from "../supply-status.fr";
import {
  allowedNextStatuses,
  SupplyPlanStatus,
} from "../hooks/supply-plan.transitions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "WAITING_QUOTE",
  "WAITING_INVOICE",
  "ORDERED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export const SuppliesPage = () => {
  const [status, setStatus] = useState<any>("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const plansQ = useSupplyPlans(status || undefined, q || undefined);
  const selectedPlanQ = useSupplyPlan(selected || undefined);
  const createPlan = useCreateSupplyPlan();
  const autoPrice = useAutoPricePlan();
  const changeStatus = useChangePlanStatus();
  const providersQ = useProvidersList({
    page: 1,
    limit: 100,
    search: "",
    isActive: true,
  } as any);

  const plans = (plansQ.data?.items ?? []) as any[];

  const safePlans = Array.isArray(plans) ? plans : [];
  const next = allowedNextStatuses(status);

  const providers = useMemo(() => {
    const arr = (providersQ.data?.items ??
      (providersQ.data as any)?.data?.items ??
      (providersQ.data as any)?.items ??
      []) as any[];
    return arr;
  }, [providersQ.data]);

  const providerMap = useMemo(() => {
    const m = new Map<string, any>();
    providers.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [providers]);

  function supplierSummary(plan: any) {
    const lines = plan?.lines ?? [];
    const ids = Array.from(
      new Set(
        lines
          .map((l: any) => l.selectedSupplierId)
          .filter(Boolean)
          .map(String),
      ),
    );

    if (ids.length === 0) return "-";

    const names = ids
      .map((id: any) => providerMap.get(id)?.name ?? id)
      .filter(Boolean);

    if (names.length === 1) return names[0];
    return `${names[0]} +${names.length - 1}`;
  }

  const handleCreate = async () => {
    const doc = await createPlan.mutateAsync({
      // le backend prend createdByUserId depuis getUserId() (header/x-user-id ou req.user)
      lines: [],
    });
    setSelected(doc);
  };
  return (
    <div className="space-y-4 mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Fournitures</h1>
        <p className="text-sm text-muted-foreground">
          Prévisionnel, Articles et Prix fournisseurs - tout sur un seul écran.
        </p>
      </div>

      <Guidelines
        variant="info"
        title="Approvisionnement prévisionnel : comment ça marche ?"
        description="Suivez vos besoins, comparez les prix fournisseurs et tracez les étapes jusqu’à la livraison."
        items={[
          "1) Créez d’abord les Articles (rame papier, eau, toner…).",
          "2) Renseignez les Prix fournisseurs (fournisseur + article + prix).",
          "3) Créez une Prévision puis ajoutez des lignes (article, quantité, fournisseur).",
          "Utilisez “Prix auto” pour proposer le meilleur prix disponible.",
          "Faites évoluer le statut : En attente devis → Commandé → Livré → Terminé (ou Annulé).",
          "Les prix sont “snapshot” : un changement de prix plus tard ne modifie pas l’historique.",
        ]}
      />

      <Card className="p-3">
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="plans">Prévisionnel</TabsTrigger>
            <TabsTrigger value="items">Articles</TabsTrigger>
            <TabsTrigger value="prices">Prix fournisseurs</TabsTrigger>
          </TabsList>

          {/* =======================
              TAB 1 : PRÉVISIONNEL
             ======================= */}
          <TabsContent value="plans" className="pt-3">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={handleCreate} disabled={createPlan.isPending}>
                  Nouvelle prévision
                </Button>

                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Tous statuts</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {SUPPLY_STATUS_LABEL_FR[s as SupplyPlanStatus]}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Recherche référence (AP-2026-0001)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-[260px]"
                  />
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs bg-muted/40">
                  <div className="col-span-2 font-medium">Référence</div>
                  <div className="col-span-2 flex items-start text-left font-medium">
                    Statut
                  </div>
                  <div className="col-span-2 font-medium">Date</div>
                  <div className="col-span-2 font-medium">Fournisseur</div>
                  <div className="col-span-2 font-medium">Total</div>
                  <div className="col-span-2 font-medium text-right">
                    Actions
                  </div>
                </div>

                {plansQ.isLoading && (
                  <div className="p-3 text-sm">Chargement...</div>
                )}
                {plansQ.isError && (
                  <div className="p-3 text-sm text-red-600">
                    {String((plansQ.error as any)?.message)}
                  </div>
                )}

                {!plansQ.isLoading && safePlans.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">
                    Aucune prévision.
                  </div>
                )}

                {safePlans.map((p: any) => {
                  const status = toSupplyPlanStatus(p?.status);

                  return (
                    <div
                      key={p._id}
                      className="grid grid-cols-12 gap-2 px-3 py-2 text-sm border-t hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(p._id)}
                    >
                      <button
                        className="col-span-2 text-left hover:underline"
                        onClick={() => setSelected(p._id)}
                      >
                        {p.reference}
                      </button>

                      <div className="col-span-2">
                        <Badge
                          className="py-1 rounded-lg"
                          variant={SUPPLY_STATUS_VARIANT[status]}
                        >
                          {SUPPLY_STATUS_LABEL_FR[status]}
                        </Badge>
                      </div>

                      <div className="col-span-2 text-muted-foreground">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : "-"}
                      </div>

                      <div className="col-span-2 font-medium">
                        {supplierSummary(p)}
                      </div>
                      <div className="col-span-2 font-medium">
                        {p.estimatedTotal ?? 0} {p.currency ?? "XAF"}
                      </div>

                      {/* ACTIONS */}
                      <div
                        className="col-span-2 flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => autoPrice.mutate(p._id)}
                          disabled={autoPrice.isPending}
                        >
                          Prix auto
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Statut <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {allowedNextStatuses(status).map((st) => (
                              <DropdownMenuItem
                                key={st}
                                onClick={() =>
                                  changeStatus.mutate({ id: p._id, to: st })
                                }
                              >
                                {SUPPLY_STATUS_LABEL_FR[st]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>

              <PlanDrawer
                plan={selectedPlanQ.data ?? null}
                open={!!selected}
                onOpenChange={(o) => !o && setSelected(null)}
              />
            </div>
          </TabsContent>

          {/* =======================
              TAB 2 : ARTICLES
             ======================= */}
          <TabsContent value="items" className="pt-3">
            <SupplyItemsTab />
          </TabsContent>

          {/* =======================
              TAB 3 : PRIX FOURNISSEURS
             ======================= */}
          <TabsContent value="prices" className="pt-3">
            <SupplierPricesTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
