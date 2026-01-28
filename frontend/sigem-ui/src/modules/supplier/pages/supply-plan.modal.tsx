import { useModalStore } from "@/stores/modal-store";
import { ModalTypes } from "@/types/modal.types";
import { useSupplyPlan } from "../hooks/supplies.queries";
import PlanDrawer from "../_components/PlanDrawer";

export function SupplyPlanModal() {
  const { name, data, closeModal } = useModalStore();

  const open = name === ModalTypes.SUPPLY_PLAN;

  const planId = typeof data === "string" ? data : (data as any)?._id;

  const planQ = useSupplyPlan(open ? planId : undefined);

  return (
    <PlanDrawer
      plan={planQ.data ?? null}
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    />
  );
}
