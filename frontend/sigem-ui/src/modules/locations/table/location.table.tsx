import { TableComponent } from "@/components/shared/table/table";
import { LocationDTO } from "@/modules/assets/types/asset-type";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { useLocation } from "../hooks/useLocation";
import { Guidelines } from "@/common/guidelines";

export const LocationSection = () => {
  const { list } = useLocation();
  const { data: locations, error, isLoading } = list;

  const items: LocationDTO[] = locations?.items || [];

  return (
    <>
      {/* RIGHT PANEL */}
      <section className="space-y-4">
        {/* TABLE */}
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : error ? (
          <p className="text-red-500 text-sm">Location service unavailable.</p>
        ) : (
          <TableComponent
            emptyState="No location found"
            btnActionIcon={<Plus className="w-4 h-4" />}
            // onSubmit={() => openModal(ModalTypes.LOCATION_FORM)}
            filterKeys={["code", "direction", "bureau"]}
            columns={columns}
            items={items}
            onBulkAction={(selected: any[]) => console.log(selected)}
          />
        )}

        <div className="pb-4">
          <Guidelines
            variant="info"
            className="-mt-2"
            title="Comment fonctionnent les emplacements ?"
            description="Structurez et localisez précisément les biens et véhicules de l’organisation."
            items={[
              "Un emplacement représente un bureau ou espace de travail.",
              "Chaque emplacement suit une hiérarchie fixe : Site → Bâtiment → Direction → Bureau.",
              "Les emplacements sont utilisés pour : localiser les biens, produire des statistiques par site ou direction.",
              "Le code d’emplacement est généré automatiquement à partir de cette hiérarchie.",
              "Modifier un emplacement impacte tous les éléments qui y sont rattachés.",
            ]}
          />
        </div>
      </section>
    </>
  );
};
