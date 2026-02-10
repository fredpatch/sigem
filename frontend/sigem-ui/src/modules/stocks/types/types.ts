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
