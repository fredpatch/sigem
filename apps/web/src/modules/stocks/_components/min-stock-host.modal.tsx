import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { StockMinLevelModal } from "./stock-minLevel.modal";

export const MinLevelStockHostModal = () => {
  const { name, data, closeModal } = useModalStore();

  if (name !== ModalTypes.STOCK_MIN_LEVEL_FORM) return null;

  const minData = (data ?? {}) as any;

  return (
    <>
      <StockMinLevelModal
        open
        onOpenChange={(v) => !v && closeModal()}
        locationId={minData.locationId}
        supplyItemId={minData.supplyItemId}
        currentMinLevel={minData.currentMinLevel}
        supplyItemLabel={minData.supplyItemLabel}
        onSuccess={() => closeModal()}
      />
    </>
  );
};
