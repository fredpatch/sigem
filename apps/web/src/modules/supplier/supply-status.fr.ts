import { SupplyPlanStatus } from "./hooks/supply-plan.transitions";

export const SUPPLY_STATUS_LABEL_FR: Record<SupplyPlanStatus, string> = {
  DRAFT: "Brouillon",
  SCHEDULED: "Planifié",
  WAITING_QUOTE: "En attente de devis",
  WAITING_INVOICE: "En attente de facture",
  ORDERED: "Commandé",
  DELIVERED: "Livré",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const ALL: SupplyPlanStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "WAITING_QUOTE",
  "WAITING_INVOICE",
  "ORDERED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export const SUPPLY_STATUS_VARIANT: Record<
  SupplyPlanStatus,
  | "secondary"
  | "default"
  | "destructive"
  | "outline"
  | "valide"
  | "active"
  | "pending"
  | "quote"
> = {
  DRAFT: "outline",
  SCHEDULED: "secondary",
  WAITING_QUOTE: "quote",
  WAITING_INVOICE: "valide",
  ORDERED: "active",
  DELIVERED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

export function isSupplyPlanStatus(v: unknown): v is SupplyPlanStatus {
  return typeof v === "string" && (ALL as string[]).includes(v);
}

export function toSupplyPlanStatus(v: unknown): SupplyPlanStatus {
  return isSupplyPlanStatus(v) ? v : "DRAFT";
}
