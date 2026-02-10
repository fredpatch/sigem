// stock.types.ts
import { Types } from "mongoose";

export type StockMovementType = "IN" | "OUT" | "ADJUST";

export type StockRefType = "SUPPLY_PLAN" | "RECEPTION" | "MANUAL";

export type CreateStockMovementInput = {
  orgId?: Types.ObjectId;

  type: StockMovementType;
  supplyItemId: Types.ObjectId;
  locationId: Types.ObjectId;

  // IN / OUT
  qty?: number;

  // ADJUST
  countedQty?: number; // UI-friendly

  // optional metadata
  unitCost?: number;
  providerId?: Types.ObjectId;
  refType?: StockRefType | string;
  refId?: Types.ObjectId;
  reason?: string;

  createdBy?: Types.ObjectId;
};

export function assertPositive(n: any, field: string) {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) {
    const err: any = new Error(`${field} must be a positive number`);
    err.status = 400;
    throw err;
  }
}

export function assertNumber(n: any, field: string) {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    const err: any = new Error(`${field} must be a valid number`);
    err.status = 400;
    throw err;
  }
}
