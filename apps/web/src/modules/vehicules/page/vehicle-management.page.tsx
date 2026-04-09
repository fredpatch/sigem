import { TableComponent } from "@/components/shared/table/table";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useVehicles } from "../hooks/use-vehicle";
import { Loader2 } from "lucide-react";
import { Guidelines } from "@/common/guidelines";
import { mgVehicleColumns } from "../_components/table/mg.columns";

export const VehicleManagementPage = () => {
  const { openModal } = useModalStore();
  const { mgTable } = useVehicles();
  const { data: vehicles, isLoading, error } = mgTable;

  return (
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
          items={vehicles || []}
          columns={mgVehicleColumns}
          toolbar={{
            tableId: "mg-vehicles",
            enableGlobalSearch: true,
            globalSearchPlaceholder: "Plaque, marque, utilisateur, direction…",
            enableResetFilters: true,
            columnFilters: [
              "plateNumber",
              "assignedToName",
              "assignedToDirection",
              "createdAt",
            ],
            enableExport: true,
            export: {
              enableColumnPicker: true,
              formats: ["csv", "xlsx", "pdf"],
              filename: `Programme de suivi du matériel roulant - ${new Date().toLocaleDateString("fr-FR", { year: "numeric" })}`,
            },
            presets: [],
          }}
        />
      )}

      <div className="pb-4">
        <Guidelines
          variant="info"
          title="Gestion du parc automobile - mode d'emploi"
          description="Le formulaire central sert à enregistrer un véhicule. Une fois créé, son suivi quotidien se fait depuis le menu déroulant de la ligne et les vues dédiées."
          items={[
            {
              title: "Ajouter un véhicule",
              text: "Cliquez sur \"Ajouter un véhicule\" pour lancer le formulaire d'enregistrement : identité, caractéristiques, affectation et, si disponible, documents initiaux.",
            },
            {
              title: "Gérer un véhicule existant",
              text: "Ouvrez le menu déroulant de la ligne pour modifier les informations du véhicule ou lancer une action ciblée sans repasser par tout le formulaire.",
            },
            {
              title: "Mettre à jour le kilométrage",
              text: "Le kilométrage se met à jour depuis le dropdown du véhicule. Gardez-le fiable pour que les échéances de maintenance restent pertinentes.",
            },
            {
              title: "Mettre à jour les documents",
              text: "Assurance, visite technique, carte parking et carte extincteur se renouvellent depuis le menu déroulant du véhicule. Les rappels et colonnes de validité s'appuient sur ces dates.",
            },
            {
              title: "Valider les opérations courantes",
              text: "La validation d'une vidange ou d'une visite technique se fait aussi depuis le dropdown du véhicule, puis le suivi détaillé se poursuit dans les écrans de maintenance.",
            },
            {
              title: "Rechercher rapidement",
              text: "Utilisez la barre de recherche pour retrouver un véhicule par plaque, marque, utilisateur ou direction.",
            },
            {
              title: "Filtrer pour produire un rapport",
              text: "Combinez les filtres et la période d'ajout pour sortir un état ciblé avant export.",
            },
            {
              title: "Export CSV / XLSX / PDF",
              text: "Le bouton \"Exporter\" génère un fichier à partir de la vue courante, de la sélection ou de l'ensemble des données.",
            },
            {
              title: "Choix des colonnes à exporter",
              text: "Utilisez \"Choisir les colonnes\" pour adapter le rapport à votre besoin : suivi du parc, affectation ou conformité documentaire.",
            },
            {
              title: "Bonnes pratiques",
              text: "Enregistrez proprement le véhicule lors de la création, puis privilégiez les actions du dropdown pour le suivi quotidien afin de garder un parcours simple et cohérent.",
            },
          ]}
        />
      </div>
    </section>
  );
};
