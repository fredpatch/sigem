import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Button } from "@/components/ui/button";
import VehiclesSidebarContent from "@/modules/vehicules/_components/vehicle-sidebar.kpi";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";

const VehiclesManagementLayout = () => {
  const { openModal } = useModalStore();

  return (
    <PageSplitLayout
      actions={
        <Button
          variant={"secondary"}
          onClick={() => openModal(ModalTypes.VEHICLE_MANAGEMENT_FORM)}
        >
          <span className="flex gap-1 items-center">
            <Plus />
            Ajouter un vehicule
          </span>
        </Button>
      }
      title="Gestion du parc automobile"
      subtitle="Suivi des véhicules, de leur statut et de leur affectation."
      sidebarContent={<VehiclesSidebarContent />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};

export default VehiclesManagementLayout;
