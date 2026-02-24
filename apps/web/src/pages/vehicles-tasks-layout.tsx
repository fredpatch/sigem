import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
import { Button } from "@/components/ui/button";
import { VehicleTasksSidebarContent } from "@/modules/vehicules/_components/kpi-sidebar";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";

const VehiclesTasksLayout = () => {
  const { openModal } = useModalStore();

  return (
    <PageSplitLayout
      actions={
        <Button
          variant={"secondary"}
          onClick={() => openModal(ModalTypes.TEMPLATE_TASKS_FORM)}
        >
          <span className="flex gap-1 items-center">
            <Plus />
            <span>Ajouter une</span> <span>modèle de suivie</span>
          </span>
        </Button>
      }
      title="Programme de suivi de maintenance du matériel roulant"
      subtitle="Suivi des échéances (assurance, visite technique, carte parking, etc.) pour l'ensemble du parc auto."
      sidebarContent={<VehicleTasksSidebarContent />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};

export default VehiclesTasksLayout;
