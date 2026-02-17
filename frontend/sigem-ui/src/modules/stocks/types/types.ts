export type MovementMode = "IN" | "OUT" | "ADJUST";

export type StockItemDto = {
  _id: string;
  supplyItemId: {
    _id: string;
    label: string;
    unit: "UNIT" | "PACK" | "BOX" | "CARTON" | "BOTTLE" | "REAM";
    labelNormalized: string;
    active: boolean;
  };
  onHand: number;
  minLevel: number;
  locationId: string;
};

export type StockMovementDto = {
  _id: string;
  type: "IN" | "OUT" | "ADJUST";
  supplyItemId: { _id: string; label: string; unit: string };
  locationId: string;
  delta: number;
  qty?: number;
  unitCost?: number;
  providerId?: { _id: string; name?: string; label?: string };
  reason?: string;
  stockBefore: number;
  stockAfter: number;
  createdAt: string;
};

// src/features/stock/types/stock-modal.types.ts
export type StockMovementMode = "IN" | "OUT" | "ADJUST";

export type StockMovementModalData = {
  mode: StockMovementMode;
  locationId: string;
  supplyItemId?: string; // si déclenché depuis une ligne
};

export type StockKpisResponse = {
  success: boolean;
  data: {
    totalItems: number;
    totalQuantity: number;
    belowMinCount: number;

    lastMovementAt: string | null;
    lastMovements: Array<{
      id: string;
      type: "IN" | "OUT" | "ADJUST";
      delta: number;
      stockBefore: number;
      stockAfter: number;
      unitCost: number | null;
      reason: string | null;
      createdAt: string;
      supplyItem: { id: string; label: string; unit?: string } | null;
      provider: { id: string; name: string | null } | null;
    }>;

    // ✅ NEW
    movementBreakdown30d: {
      inQty: number;
      outQty: number;
      adjustCount: number;
    };

    monthSummary: {
      month: string; // "YYYY-MM"
      inQty: number;
      outQty: number;
      net: number;
      movementsCount: number;
    };

    stockValue: {
      totalValueXaf: number;
      itemsValued: number;
      itemsMissingCost: number;
    };

    belowMinTop: Array<{
      stockItemId: string;
      supplyItemId: string | null;
      label: string;
      unit: string | null;
      onHand: number;
      minLevel: number;
    }>;
  };
};
