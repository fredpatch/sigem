import { useMemo, useState } from "react";
import {
  useCreateSupplyPlan,
  useSupplyPlan,
  useSupplyPlans,
} from "../hooks/supplies.queries";
import PlanDrawer from "../_components/PlanDrawer";
import { Button } from "@/components/ui/button";

import SupplyItemsTab from "../_components/SupplyItemsTab";
import SupplierPricesTab from "../_components/SupplierPricesTab";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProvidersList } from "@/modules/providers/hooks/use-providers";
import { Guidelines } from "@/common/guidelines";
import { SUPPLY_STATUS_LABEL_FR } from "../supply-status.fr";
import { SupplyPlanStatus } from "../hooks/supply-plan.transitions";
import { buildSupplyPlanColumns } from "../_components/columns";
import {
  TableComponent,
  TableToolbarConfig,
} from "@/components/shared/table/table";

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
  const [selected, setSelected] = useState<any | null>(null);

  const plansQ = useSupplyPlans(status || undefined, undefined);
  const selectedPlanQ = useSupplyPlan(selected || undefined);
  const createPlan = useCreateSupplyPlan();
  const providersQ = useProvidersList({
    page: 1,
    limit: 100,
    search: "",
    isActive: true,
  } as any);

  const plans = (plansQ.data?.items ?? []) as any[];

  const safePlans = Array.isArray(plans) ? plans : [];

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

  const columns = useMemo(
    () => buildSupplyPlanColumns({ supplierSummary }),
    [providerMap],
  );

  const plansToolbar: TableToolbarConfig = {
    tableId: "supplies:plans",
    enableGlobalSearch: true,
    globalSearchPlaceholder: "Rechercher (référence, fournisseur...)",
    enableResetFilters: true,
    columnFilters: ["createdAt", "total"],
    enableExport: true,
    export: {
      formats: ["csv", "xlsx", "pdf"],
      filename: "previsionnel-fournitures",
      enableColumnPicker: true,
    },

    presets: [
      //   {
      //     label: "Commandé",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       table
      //         .getColumn("status")
      //         ?.setFilterValue("ORDERED" satisfies SupplyPlanStatus);
      //     },
      //   },
      //   {
      //     label: "Livré",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       table
      //         .getColumn("status")
      //         ?.setFilterValue("DELIVERED" satisfies SupplyPlanStatus);
      //     },
      //   },
      //   {
      //     label: "En cours",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       // on garde ceux qui ne sont pas TERMINÉ/ANNULÉ via globalFilter text (simple)
      //       // option: mieux via filterFn custom (voir bonus ci-dessous)
      //       table.setGlobalFilter(""); // clean
      //       // Astuce simple: filtrer status via select n’accepte qu’une valeur.
      //       // Donc ici on met plutôt un preset "Non terminés" via custom filterFn (bonus).
      //       // En attendant, on met DRAFT comme point d’entrée.
      //       table.getColumn("status")?.setFilterValue("DRAFT");
      //     },
      //   },
      //   {
      //     label: "Tout",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       table.setGlobalFilter("");
      //     },
      //   },
      //   {
      //     label: "En attente de devis",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       table
      //         .getColumn("status")
      //         ?.setFilterValue("WAITING_QUOTE" satisfies SupplyPlanStatus);
      //     },
      //   },
      //   {
      //     label: "En attente de facture",
      //     apply: (table) => {
      //       table.resetColumnFilters();
      //       table
      //         .getColumn("status")
      //         ?.setFilterValue("WAITING_INVOICE" satisfies SupplyPlanStatus);
      //     },
      //   },
    ],
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

                  {/* <Input
                    placeholder="Recherche référence (AP-2026-0001)"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-[260px]"
                  /> */}
                </div>
              </div>

              <TableComponent
                items={safePlans}
                columns={columns as any}
                toolbar={plansToolbar}
                isLoading={plansQ.isLoading}
                emptyState={
                  <div className="text-sm text-muted-foreground">
                    Aucune prévision.
                  </div>
                }
                onRowClick={(row: any) => setSelected(row._id)}
              />

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
