import { create } from "zustand";

type ModalName =
  | "userForm"
  | "resetForm"
  | "assetForm"
  | "categoryForm"
  | "locationForm"
  | "vehicleForm"
  | "vehicle-tasksForm"
  | "vehicle-managementForm"
  | "vehicle-documentForm"
  | "vehicle-complete-tasksForm"
  | "VEHICLE_TASK_PLAN_FROM_DOCUMENT"
  | "VEHICLE_TASK_PLAN_FROM_VEHICLE"
  | "VEHICLE_DETAILS"
  | "VEHICLE_DOCUMENT_DETAILS"
  | "template-tasksForm"
  | "deleteConfirm"
  | "providersForm"
  | "productForm"
  | "purchaseForm"
  | "vehicleUpdateMileage"
  | "vehicleCompleteOilChange"
  | "vehicleCompleteTechVisit"
  | "vehicleUpdateParkingCard"
  | "vehicleUpdateInsurance"
  | "vehicleDocumentModal"
  | "supplyPlan"
  | "stockMovementForm"
  | "stockMinLevelForm"
  | null;

interface ModalState {
  name: ModalName;
  data?: any;
  openModal: (name: ModalName, data?: unknown) => void;
  closeModal: () => void;
  selectedItem?: unknown;
  setSelectedItem: (item: unknown) => void;
}

interface LocationState {
  name: ModalName;
  data?: any;
  openModal: (name: ModalName, data?: unknown) => void;
  closeModal: () => void;
  selectedItem?: unknown;
  setSelectedItem: (item: unknown) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  name: null,
  data: null,
  selectedItem: null,

  setSelectedItem: (item) => set({ selectedItem: item }),
  openModal: (name, data) => set({ name, data }),
  closeModal: () => set({ name: null, data: null }),
}));

export const useLocationStore = create<LocationState>((set) => ({
  name: null,
  data: null,
  selectedItem: null,

  setSelectedItem: (item) => set({ selectedItem: item }),
  openModal: (name, data) => set({ name, data }),
  closeModal: () => set({ name: null, data: null }),
}));
