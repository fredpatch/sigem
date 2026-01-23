import { AssetModal } from "@/modules/assets/_components/form/asset-modal";
import { CategoryModal } from "@/modules/categories/_components/form/category-modal";
import { LocationModal } from "@/modules/locations/_components/form/location-modal";
import { ProductModal } from "@/modules/providers/_components/products/product-modal";
import { ProviderModal } from "@/modules/providers/_components/provider-modal";
import { PurchaseModal } from "@/modules/providers/_components/purchases/purchase-modal";
import { ResetFormModal } from "@/modules/users/_components/forms/reset-password.modal";
import { UserFormModal } from "@/modules/users/_components/forms/user-form";
import { VehicleModal } from "@/modules/vehicules/_components/form/vehicle-modal";
import { VehicleTasksModal } from "@/modules/vehicules/_components/form/vehicle-tasks-modal";
import { VehicleTaskCompleteModal } from "@/modules/vehicules/_components/form/vehicleTask-complete-modal";
import { VehicleCompleteOilChangeModal } from "@/modules/vehicules/_components/modals/vehicle-complete-oil-change-modal";
import { VehicleDetailsModal } from "@/modules/vehicules/_components/modals/vehicle-details.modal";
import { VehicleDocumentModal } from "@/modules/vehicules/_components/modals/vehicle-document.modal";
import { VehicleUpdateMileageModal } from "@/modules/vehicules/_components/modals/vehicle-mileage-update";
import { TemplateTasksModal } from "@/modules/vehicules/_components/tasks/template-tasks-modal";

export function ModalGlobalProvider() {
  return (
    <>
      <AssetModal />
      <CategoryModal />
      <LocationModal />
      <UserFormModal />
      <ResetFormModal />
      <VehicleModal />
      <VehicleTasksModal />
      <VehicleTaskCompleteModal />

      <VehicleDetailsModal />
      <TemplateTasksModal />

      <ProviderModal />
      <ProductModal />

      <PurchaseModal />
      <VehicleCompleteOilChangeModal />
      <VehicleDocumentModal />
      <VehicleUpdateMileageModal />
    </>
  );
}
