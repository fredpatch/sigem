// src/modules/supplies/supply.helpers.ts
export function normalizeLabel(input: string) {
  return (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD") // split accents
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/\s+/g, " "); // collapse spaces
}

export type SupplyPlanStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "WAITING_QUOTE"
  | "WAITING_INVOICE"
  | "ORDERED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export const SUPPLY_PLAN_TRANSITIONS: Record<
  SupplyPlanStatus,
  SupplyPlanStatus[]
> = {
  DRAFT: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["WAITING_QUOTE", "ORDERED", "CANCELLED"],
  WAITING_QUOTE: ["WAITING_INVOICE", "ORDERED", "CANCELLED"],
  WAITING_INVOICE: ["ORDERED", "CANCELLED"],
  ORDERED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertTransition(from: SupplyPlanStatus, to: SupplyPlanStatus) {
  const allowed = SUPPLY_PLAN_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    const err = new Error(`Transition invalide: ${from} -> ${to}`);
    (err as any).status = 400;
    throw err;
  }
}

export function calcLineTotal(quantity: number, unitPrice?: number) {
  const q = Number(quantity || 0);
  const p = Number(unitPrice || 0);
  return Math.max(0, q) * Math.max(0, p);
}

export function calcEstimatedTotal(lines: Array<{ lineTotal: number }>) {
  return (lines || []).reduce((sum, l) => sum + Number(l.lineTotal || 0), 0);
}
