export type SupplyPlanStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "WAITING_QUOTE"
  | "WAITING_INVOICE"
  | "ORDERED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface SupplyPlanLine {
  itemId: string;
  labelSnapshot: string; // snapshot pour affichage stable
  unitSnapshot?: string; // idem
  quantity: number;

  // sélection fournisseur (optionnel)
  selectedSupplierId?: string;
  selectedUnitPrice?: number; // snapshot au moment de la sélection
  currency?: "XAF";

  lineTotal: number; // quantity * selectedUnitPrice (ou 0 si pas choisi)
}

export interface SupplyPlanHistoryEntry {
  at: string;
  byUserId: string;
  from: SupplyPlanStatus;
  to: SupplyPlanStatus;
  note?: string;
}

export interface SupplyPlan {
  _id: string;
  reference: string; // "AP-2026-0001"
  status: SupplyPlanStatus;

  scheduledFor?: string; // date prévue
  department?: string; // optionnel (si utile)
  createdByUserId: string;

  lines: SupplyPlanLine[];

  estimatedTotal: number; // sum(lineTotal)
  currency: "XAF";

  attachments: Array<{
    type: "QUOTE" | "INVOICE" | "OTHER";
    name: string;
    url: string;
    uploadedAt: string;
  }>;

  history: SupplyPlanHistoryEntry[];

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
