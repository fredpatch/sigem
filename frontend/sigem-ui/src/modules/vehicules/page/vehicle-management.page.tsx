import { TableComponent } from "@/components/shared/table/table";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useVehicles } from "../hooks/use-vehicle";
import { Loader2 } from "lucide-react";
// import { Guidelines } from "@/common/guidelines";
import { mgVehicleColumns } from "../_components/table/mg.columns";

export const VehicleManagementPage = () => {
  const { openModal } = useModalStore();
  const { mgTable } = useVehicles();
  const { data: vehicles, isLoading, error } = mgTable;

  return (
    <>
      {/* RIGHT PANEL */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-screen gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des tâches véhicules...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-screen gap-2 text-sm text-muted-foreground">
            <p className="text-red-500 text-sm">Vehicle service unavailable.</p>
          </div>
        ) : (
          <TableComponent
            emptyState="Aucun véhicule"
            onSubmit={() => openModal(ModalTypes.VEHICLE_MANAGEMENT_FORM)}
            filterKeys={["plateNumber", "assignedToName"]}
            items={vehicles || []}
            columns={mgVehicleColumns}
            onBulkAction={(selected: any[]) => console.log(selected)}
          />
        )}

        {/* <div className="pb-4">
          <Guidelines
            variant="info"
            title="Comment gérer le parc automobile ?"
            description="Suivez les véhicules, leur statut, leur affectation et leur kilométrage."
            items={[
              "Ajoutez un véhicule via “Ajouter un véhicule” (immatriculation, marque, modèle).",
              "Le statut indique l’état du véhicule : Actif, En maintenance, Inactif, Retiré.",
              "“Affecté à” indique si le véhicule est attribué à un agent.",
              "Le kilométrage sert au suivi d’entretien et aux alertes (mettez-le à jour régulièrement).",
              "Utilisez la recherche pour retrouver rapidement un véhicule (immatriculation, marque, modèle).",
              "Les actions à droite s’appliquent au véhicule de la ligne sélectionnée.",
              "📄 Document : ajoutez un document (assurance, visite technique, carte…) avec sa date d’expiration et ses rappels.",
              "🛠️ Tâche : planifiez une tâche (ex : vidange) - elle est automatiquement liée au véhicule.",
              "Le kilométrage doit être mis à jour régulièrement pour fiabiliser les alertes d’entretien.",
            ]}
          />
        </div> */}
      </section>
    </>
  );
};
