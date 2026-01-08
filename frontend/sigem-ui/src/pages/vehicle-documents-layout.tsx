import { PageSplitLayout } from "@/components/shared/layouts/page-split-layout";
// import { Button } from "@/components/ui/button";
import { VehicleDocumentsSidebarContent } from "@/modules/vehicules/_components/documents-kpi-sidebar";
// import { useModalStore } from "@/stores/modal-store";
// import { ModalTypes } from "@/types/modal.types";
// import { Plus } from "lucide-react";
import { Outlet } from "react-router-dom";

export const VehicleDocumentsLayout = () => {
  // const { openModal } = useModalStore();
  return (
    <PageSplitLayout
      title="Gestion des documents du matériel roulant"
      subtitle="Suivi des assurances, visites techniques, cartes de parking, cartes extincteur, etc. pour l'ensemble du parc auto."
      sidebarContent={<VehicleDocumentsSidebarContent />}
    >
      <Outlet />
    </PageSplitLayout>
  );
};

//actions={
//  <div className="flex gap-2">
//    {/* Pour l’instant : création document globale.
//       Si ton VehicleDocumentModal attend un vehicleId,
//       on adaptera plus tard (ou on n’utilise ce bouton
//       que quand on aura un véhicule sélectionné). */}
//    <Button
//      variant="default"
//      onClick={() => openModal(ModalTypes.VEHICLE_DOCUMENT_FORM)}
//    >
//      <span className="flex items-center gap-1">
//        <Plus className="w-4 h-4" />
//        Ajouter un document
//      </span>
//    </Button>
//  </div>
//}
