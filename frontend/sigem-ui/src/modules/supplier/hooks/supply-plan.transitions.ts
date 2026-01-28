export type SupplyPlanStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "WAITING_QUOTE"
  | "WAITING_INVOICE"
  | "ORDERED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export const transitions: Record<SupplyPlanStatus, SupplyPlanStatus[]> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["WAITING_QUOTE", "ORDERED", "CANCELLED"],
  WAITING_QUOTE: ["WAITING_INVOICE", "ORDERED", "CANCELLED"],
  WAITING_INVOICE: ["ORDERED", "CANCELLED"],
  ORDERED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function allowedNextStatuses(from: SupplyPlanStatus) {
  return transitions[from] ?? [];
}
