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

export type SupplyDashboardDto = {
  range: { from: string; to: string };

  plans: {
    count: number;
    totalAmount: number;
    byStatus: Record<SupplyPlanStatus, number>;
    withMissingPricesCount: number; // lignes sans prix ou plans avec total=0
    topSuppliers: Array<{
      supplierId: string;
      supplierName?: string; // optionnel si lookup providers dispo
      plansCount: number;
      amount: number;
    }>;
    lastCreated: Array<{
      id: string;
      reference: string;
      status: SupplyPlanStatus;
      createdAt: string;
      amount: number;
    }>;
  };

  items: {
    activeCount: number;
    totalCount: number;
    withoutAnySupplierPriceCount: number;
    coveragePct: number; // % d’articles actifs ayant ≥1 prix
    topItems: Array<{
      itemId: string;
      label?: string;
      linesCount: number;
      quantitySum: number;
      amount: number;
    }>;
  };

  prices: {
    count: number;
    updated7d: number;
    updated30d: number;
    cheapestByItemSample?: Array<{
      itemId: string;
      itemLabel?: string;
      supplierId: string;
      supplierName?: string;
      unitPrice: number;
      updatedAt: string;
    }>;
  };
};

export const ALL_STATUSES: SupplyPlanStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "WAITING_QUOTE",
  "WAITING_INVOICE",
  "ORDERED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export function toIso(d: Date) {
  return d.toISOString();
}

export function parseRange(input?: { from?: string; to?: string }) {
  const now = new Date();
  const from = input?.from
    ? new Date(input.from)
    : new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const to = input?.to ? new Date(input.to) : now;
  return { from, to };
}

export function fillStatusZeros(
  rows: Array<{ _id: SupplyPlanStatus; n: number }>,
): Record<SupplyPlanStatus, number> {
  const base = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<
    SupplyPlanStatus,
    number
  >;

  for (const r of rows) {
    if (!r?._id) continue;
    base[r._id] = Number(r.n ?? 0);
  }
  return base;
}
