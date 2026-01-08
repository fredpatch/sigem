import { NotificationBell } from "@/components/notification-bell";
import { Separator } from "@/components/ui/separator";
import { AssetKPIDashboard } from "@/modules/assets/_components/kpi-dashboard";
import { VehicleDocumentsKPIDashboard } from "@/modules/vehicules/VehicleDocumentsKPIDashboard";
import { VehicleKPIDashboard } from "@/modules/vehicules/VehicleKPIDashboard";

export const MGMonitoringOverview = () => {
  return (
    <div className="space-y-6">
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

        <span className="relative left-15 absolute">
          <NotificationBell />
        </span>

        {/* <span className="relative left-25 absolute">
          <p className="text-xs text-muted-foreground">
            Action rapides coming soon...
          </p>
        </span> */}
      </header>

      <Separator />

      {/* GRID 2 COLONNES */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* COLONNE ASSETS */}
        <section className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Parc matériel & inventaire
              </h2>
              <p className="text-xs text-muted-foreground">
                Vue synthétique du patrimoine : statut, familles, localisation.
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card/60 backdrop-blur-sm p-4 lg:p-5 shadow-2xl">
            <AssetKPIDashboard />
          </div>
        </section>

        {/* COLONNE VÉHICULES */}
        <section className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Parc automobile</h2>
              <p className="text-xs text-muted-foreground">
                Suivi des véhicules, tâches de maintenance et conformité.
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border bg-card/60 backdrop-blur-sm p-4 lg:p-5 shadow-xl gap-6">
            <VehicleKPIDashboard />
            <VehicleDocumentsKPIDashboard />
          </div>
        </section>
      </div>
    </div>
  );
};
