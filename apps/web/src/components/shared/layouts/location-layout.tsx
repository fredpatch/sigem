import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";
import { PageSplitLayout } from "./page-split-layout";
import { LocationDTO } from "@/modules/assets/types/asset-type";
import { useLocation } from "@/modules/locations/hooks/useLocation";
import { LocationKPISidebar } from "@/modules/locations/_components/kpi-sidebar";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";

const LocationLayout = () => {
  const { list } = useLocation();
  const { openModal } = useModalStore();
  const { data } = list;

  const locations: LocationDTO[] = data?.items || [];

  const totalLocations = locations.length;
  const localisationCount = new Set(locations.map((l) => l.localisation)).size;
  const buildingCount = new Set(
    locations.map((l) => `${l.localisation}-${l.batiment}`)
  ).size;
  const directionCount = new Set(locations.map((l) => l.direction)).size;

  const byLocalisation = locations.reduce<Record<string, number>>(
    (acc, loc) => {
      acc[loc.localisation] = (acc[loc.localisation] || 0) + 1;
      return acc;
    },
    {}
  );

  const byDirection = locations.reduce<Record<string, number>>((acc, loc) => {
    acc[loc.direction] = (acc[loc.direction] || 0) + 1;
    return acc;
  }, {});

  const actions = (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => openModal(ModalTypes.LOCATION_FORM)}
    >
      <Plus className="h-4 w-4" />
      Ajouter un emplacement
    </Button>
  );
  return (
    <PageSplitLayout
      title="Gestion des emplacements"
      subtitle="Gérez les sites, bâtiments, directions et bureaux."
      actions={actions}
      sidebarContent={
        <LocationKPISidebar
          totalLocations={totalLocations}
          localisationCount={localisationCount}
          buildingCount={buildingCount}
          directionCount={directionCount}
          byLocalisation={byLocalisation}
          byDirection={byDirection}
        />
      }
    >
      <Outlet />
    </PageSplitLayout>
  );
};

export default LocationLayout;
