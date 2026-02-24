import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { StockMovementModalData } from "../types/types";
import { StockMovementModal } from "./stock-movement.modal";

export const StockHostModal = () => {
  const { name, data, closeModal } = useModalStore();

  if (name !== ModalTypes.STOCK_MOVEMENT_FORM) return null;

  const payload = (data ?? {}) as StockMovementModalData;

  return (
    <>
      <StockMovementModal
        open
        onOpenChange={(v) => {
          if (!v) closeModal();
        }}
        mode={payload.mode}
        locationId={payload.locationId}
        supplyItemId={payload.supplyItemId}
        onSuccess={() => closeModal()}
      />
    </>
  );
};
