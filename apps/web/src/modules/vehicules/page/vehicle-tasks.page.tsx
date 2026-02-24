import { TableComponent } from "@/components/shared/table/table";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Loader2 } from "lucide-react";
// import { useVehicleTasksContext } from "../provider/vehicle-tasks.context";
import { useVehicleTasks } from "../hooks/use-vehicle-tasks";
import { vehicleTasksColumns } from "../_components/table/columns";
import { Guidelines } from "@/common/guidelines";

export const VehicleTasksPage = () => {
  const { openModal } = useModalStore();
  const { items, isLoading, error } = useVehicleTasks();

  return (
    <>
      {/* RIGHT PANEL */}
      <section className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mx-auto h-screen">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des tâches véhicules...
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">
            Vehicle tasks service unavailable.
          </p>
        ) : (
          <TableComponent
            emptyState="No vehicle tasks found"
            onSubmit={() => openModal(ModalTypes.VEHICLE_TASKS_FORM)}
            filterKeys={["task", "status", "vehicleLabel"]}
            columns={vehicleTasksColumns}
            items={items}
            onBulkAction={(selected: any[]) => console.log(selected)}
          />
        )}

        <div className="pb-4">
          <Guidelines
            variant="info"
            title="Comment fonctionne le programme de suivi de maintenance ?"
            description="Centralisez le suivi des entretiens, documents et échéances pour l’ensemble du parc automobile."
            items={[
              "Cette page regroupe toutes les tâches de suivi des véhicules (vidange, assurance, visite technique, etc.).",
              "Chaque tâche est liée à un véhicule et provient soit d’un modèle récurrent, soit d’une création manuelle.",
              "L’échéance peut être basée sur une date, un kilométrage, ou les deux.",
              "Les statuts évoluent automatiquement : À venir → Planifiée → En retard → Terminée.",
              "Utilisez les filtres pour afficher uniquement les tâches ouvertes, en retard ou terminées.",
            ]}
          />
        </div>
      </section>
    </>
  );
};
