import { ActionTable } from "@/components/shared/table/action.component";
import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { Row } from "@tanstack/react-table";
import { useStockContextStore } from "../store/use-stock-context.store";
import { Minus, Plus, SlidersHorizontal } from "lucide-react";

interface Props {
  row: Row<any>;
}

export const StockActionCell = ({ row }: Props) => {
  const { openModal } = useModalStore();
  const { locationId } = useStockContextStore();

  const openStockModal = (
    mode: "IN" | "OUT" | "ADJUST",
    supplyItemId?: string,
  ) => {
    openModal(ModalTypes.STOCK_MOVEMENT_FORM, {
      mode,
      locationId,
      supplyItemId,
    });
  };

  const openMinLevelModal = (row: any) => {
    openModal(ModalTypes.STOCK_MIN_LEVEL_FORM, {
      locationId,
      supplyItemId: row.supplyItemId._id,
      currentMinLevel: row.minLevel,
      supplyItemLabel: row.supplyItemId?.label,
    });
  };

  return (
    <ActionTable
      row={row}
      actions={[
        {
          label: "Entrée",
          variant: "secondary",
          onClick: () => openStockModal("IN", row.original.supplyItemId._id),
          icon: <Plus className="size-4" />,
        },
        {
          label: "Sortie",
          variant: "destructive",
          onClick: () => openStockModal("OUT", row.original.supplyItemId._id),
          icon: <Minus className="size-4" />,
        },
        {
          label: "Ajuster stock",
          variant: "outline",
          onClick: () =>
            openStockModal("ADJUST", row.original.supplyItemId._id),
          icon: <SlidersHorizontal className="size-4" />,
        },
        {
          label: "Ajuster seuil",
          variant: "tertiary",
          onClick: () => openMinLevelModal(row.original),
          icon: <SlidersHorizontal className="size-4" />,
        },
      ]}
    />
  );
};
