// src/features/vehicles/pages/vehicle-documents-page.tsx
import { Loader2 } from "lucide-react";

// import { vehicleDocumentColumns } from "../components/vehicle-document-columns";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useVehicleDocumentsMonitoring } from "../hooks/use-vehicle-documents";
import { TableComponent } from "@/components/shared/table/table";
import { vehicleDocumentColumns } from "../_components/table/vehicle-document-columns";
import { Guidelines } from "@/common/guidelines";

export const VehicleDocumentsPage = () => {
  const { openModal } = useModalStore();
  const { data: items, isLoading, isError } = useVehicleDocumentsMonitoring();

  return (
    <section className="space-y-4">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center mx-auto h-screen">
          <Loader2 className="w-4 h-4 animate-spin" />
          Chargement des documents véhicules...
        </div>
      ) : isError ? (
        <p className="text-red-500 text-sm">
          Vehicle documents service unavailable.
        </p>
      ) : (
        <TableComponent
          emptyState="Aucun document véhicule trouvé"
          onSubmit={() => openModal(ModalTypes.VEHICLE_DOCUMENT_FORM)}
          filterKeys={["type", "vehicleId.model", "document", "reference"]}
          columns={vehicleDocumentColumns}
          items={items}
          onBulkAction={(selected: any[]) => console.log(selected)}
        />
      )}

      <div className="pb-4 space-y-2">
        <Guidelines
          showHelpLink
          helpRef={{ section: "documents", topic: "validity-status" }}
          variant="info"
          title="Comment gérer les documents du parc automobile ?"
          description="Suivez la validité des documents réglementaires de l’ensemble des véhicules."
          items={[
            "Cette page centralise tous les documents des véhicules (assurance, visite technique, cartes, extincteurs, etc.).",
            "Chaque document est lié à un véhicule précis et possède une date d’expiration.",
            "Le statut indique si le document est Valide, Bientôt à échéance ou Expiré.",
            "Les rappels définissent quand les alertes sont déclenchées avant expiration.",
            "Utilisez les filtres pour identifier rapidement les documents critiques.",
          ]}
        />

        <Guidelines
          variant="warning"
          showHelpLink={false}
          compact
          title="Documents et tâches : comment ça fonctionne"
          items={[
            "Un document expiré peut déclencher une tâche de renouvellement.",
            "Les modèles liés à un type de document automatisent le suivi.",
            "Supprimer un document supprime son suivi associé.",
          ]}
        />
      </div>
    </section>
  );
};
