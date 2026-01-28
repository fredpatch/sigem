import { SupplyPlanStatus } from "../models/supplier-plan.model";

const transitions: Record<SupplyPlanStatus, SupplyPlanStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["WAITING_QUOTE", "ORDERED", "CANCELLED"],
  WAITING_QUOTE: ["WAITING_INVOICE", "ORDERED", "CANCELLED"],
  WAITING_INVOICE: ["ORDERED", "CANCELLED"],
  ORDERED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: SupplyPlanStatus, to: SupplyPlanStatus) {
  return transitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: SupplyPlanStatus, to: SupplyPlanStatus) {
  if (!canTransition(from, to)) {
    const err = new Error(`Transition invalide: ${from} → ${to}`);
    // @ts-ignore
    err.status = 400;
    throw err;
  }
}
