import { NotificationBell } from "@/components/notification-bell";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetKPIDashboard } from "@/modules/assets/_components/kpi-dashboard";
import { SupplyKPIDashboard } from "@/modules/supplier/_components/SupplyKPIDashboard";
import { VehicleDocumentsKPIDashboard } from "@/modules/vehicules/VehicleDocumentsKPIDashboard";
import { VehicleKPIDashboard } from "@/modules/vehicules/VehicleKPIDashboard";

export const MGMonitoringOverview = () => {
  return (
    <div className="space-y-6 w-full">
      {/* HEADER GLOBAL */}
      <header className="space-y-1 w-full text-center flex items-center justify-center">
        <span>
          <h1 className="text-2xl font-bold tracking-tight">
            Vue d’ensemble - Monitoring immobilisation et maintenance du
            materiel
          </h1>
          <p className="text-sm text-muted-foreground">
            Synthèse des indicateurs clés pour le parc matériel et le parc
            automobile.
          </p>
        </span>

        <span className="relative left-15">
          <NotificationBell />
        </span>

        {/* <span className="relative left-25 absolute">
          <p className="text-xs text-muted-foreground">
            Action rapides coming soon...
          </p>
        </span> */}
      </header>

      <Separator />

      {/* TABS KPI */}
      <Tabs defaultValue="assets" className="w-full">
        <div className="flex items-center justify-center">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="assets">Parc matériel</TabsTrigger>
            <TabsTrigger value="vehicles">Parc automobile</TabsTrigger>
            <TabsTrigger value="supplies">Fournitures</TabsTrigger>
          </TabsList>
        </div>

        {/* ASSETS */}
        <TabsContent value="assets" className="pt-4">
          <section className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold">
                Parc matériel & inventaire
              </h2>
              <p className="text-xs text-muted-foreground">
                Vue synthétique du patrimoine : statut, familles, localisation.
              </p>
            </div>

            <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 lg:p-5 shadow-2xl">
              <AssetKPIDashboard />
            </div>
          </section>
        </TabsContent>

        {/* VEHICLES */}
        <TabsContent value="vehicles" className="pt-4">
          <section className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Parc automobile</h2>
              <p className="text-xs text-muted-foreground">
                Suivi des véhicules, tâches de maintenance et conformité.
              </p>
            </div>

            <div className="flex flex-col rounded-xl border bg-card/60 backdrop-blur-sm p-4 lg:p-5 shadow-xl gap-6">
              <VehicleKPIDashboard />
              <VehicleDocumentsKPIDashboard />
            </div>
          </section>
        </TabsContent>

        {/* SUPPLIES */}
        <TabsContent value="supplies" className="pt-4">
          <section className="space-y-3">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Fournitures</h2>
              <p className="text-xs text-muted-foreground">
                Prévisionnel, catalogue articles et prix fournisseurs.
              </p>
            </div>

            <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 lg:p-5 shadow-xl">
              <SupplyKPIDashboard />
              {/* ou ton composant actuel: <KpiSupplierDashboard /> */}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};
