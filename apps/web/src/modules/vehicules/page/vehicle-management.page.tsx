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
            items={vehicles || []}
            columns={mgVehicleColumns}
            toolbar={{
              tableId: "mg-vehicles",

              enableGlobalSearch: true,
              globalSearchPlaceholder:
                "Plaque, marque, utilisateur, direction…",

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

              presets: [
                // {
                //   label: "Non affectés",
                //   apply: (table) => {
                //     table.setColumnFilters([
                //       { id: "assignedToName", value: "" },
                //     ]);
                //   },
                // },
              ],
            }}
          />
        )}

        <div className="pb-4">
          <Guidelines
            variant="info"
            title="Gestion du parc automobile — mode d’emploi"
            description="Gérez les véhicules, suivez les documents (assurance, visite technique, extincteur, parking) et exportez des rapports filtrés."
            items={[
              {
                title: "Ajouter un véhicule",
                text: "Cliquez sur “Ajouter un véhicule” et renseignez l’immatriculation, la marque, le modèle et l’affectation si nécessaire.",
              },
              {
                title: "Rechercher rapidement",
                text: "Utilisez la barre de recherche pour retrouver un véhicule par plaque, marque ou utilisateur.",
              },
              {
                title: "Filtrer pour produire un rapport",
                text: "Combinez les filtres (ex : utilisateur/direction) et le filtre de période “Date d’ajout” pour sortir un état précis (ex : véhicules ajoutés entre X et Y).",
              },
              {
                title: "Comprendre les statuts de validité",
                text: "Les colonnes Assurance / Extincteur / Visite technique / Parking affichent une validité (jours restants). Pensez à renouveler avant expiration.",
              },
              {
                title: "Mettre à jour l’entretien",
                text: "Le kilométrage et les informations Vidange / Checking servent aux alertes de maintenance. Mettez-les à jour régulièrement pour fiabiliser le suivi.",
              },
              {
                title: "Actions par véhicule",
                text: "Utilisez le menu “Actions” d’une ligne pour ouvrir le détail, ajouter/mettre à jour un document, ou effectuer les opérations d’entretien.",
              },
              {
                title: "Sélection multiple",
                text: "Cochez des lignes pour préparer une opération groupée ou exporter uniquement une sélection (utile pour un rapport ciblé).",
              },
              {
                title: "Export CSV / XLSX / PDF",
                text: "Le bouton “Exporter” génère un fichier à partir de la vue courante (filtres + tri), de la sélection, ou de l’ensemble des données.",
              },
              {
                title: "Choix des colonnes à exporter",
                text: "Utilisez “Choisir les colonnes” avant l’export pour adapter le rapport (ex : ne garder que Véhicule, Utilisateur, Assurance, Visite tech.).",
              },
              {
                title: "Bonnes pratiques",
                text: "Renseignez les dates de délivrance/expiration dès réception d’un document, et ajoutez des notes (observations) pour faciliter le suivi et les contrôles.",
              },
            ]}
          />
        </div>
      </section>
    </>
  );
};
