import mongoose, { Types } from "mongoose";
import { SupplyItemEntity } from "../../supplies/models/supply-item.model";
import {
  assertNumber,
  assertPositive,
  CreateStockMovementInput,
} from "../types/types";
import { StockItemModel } from "../models/stock-item.model";
import { StockMovementModel } from "../models/stock-movement.model";
import { normalizeLabel } from "../../supplies/supply.helpers";
import { SupplierPriceEntity } from "../../supplies/models/supplier-price.model";

const DEFAULT_BLOCK_NEGATIVE = true;

function badRequest(msg: string) {
  const err: any = new Error(msg);
  err.status = 400;
  return err;
}

// helper to ensure number (avoid NaN, undefined)
function stock_attachNumber(n: any) {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? x : 0;
}

export class StockService {
  /**
   * Resolve unit cost for IN:
   * - if provided in input => use it
   * - else if supplierId is provided => lookup SupplierPrice(supplierId, itemId)
   * - else => undefined
   */
  async resolveUnitCost(params: {
    type: "IN" | "OUT" | "ADJUST";
    supplierId?: Types.ObjectId; // en réalité: providerId envoyé
    supplyItemId: Types.ObjectId;
    providedUnitCost?: number;
  }) {
    if (params.type !== "IN") return undefined;

    // 1) explicit unitCost wins
    if (
      typeof params.providedUnitCost === "number" &&
      Number.isFinite(params.providedUnitCost) &&
      params.providedUnitCost >= 0
    ) {
      return params.providedUnitCost;
    }

    // 1) Try as real supplierId (expected)
    const byPair = await SupplierPriceEntity.findOne({
      supplierId: params.supplierId,
      itemId: params.supplyItemId,
    }).lean();

    if (byPair?.unitPrice != null) return byPair.unitPrice;

    // 2) Fallback: if caller sent SupplierPrice._id by mistake
    const byId = await SupplierPriceEntity.findById(params.supplierId).lean();
    if (
      byId?.unitPrice != null &&
      String(byId.itemId) === String(params.supplyItemId)
    ) {
      return byId.unitPrice;
    }

    return undefined;
  }

  async createStockMovement(
    input: CreateStockMovementInput,
    opts?: { blockNegative?: boolean },
  ) {
    const blockNegative = opts?.blockNegative ?? DEFAULT_BLOCK_NEGATIVE;

    // 0) validations minimales
    if (!input.type) throw badRequest("type is required");
    if (!input.supplyItemId) throw badRequest("supplyItemId is required");
    if (!input.locationId) throw badRequest("locationId is required");

    // 1) vérifier item existe & actif (MG-friendly)
    const item = await SupplyItemEntity.findById(input.supplyItemId).lean();
    if (!item)
      throw Object.assign(new Error("Supply item not found"), { status: 404 });
    if (item.active === false) throw badRequest("Supply item is inactive");

    // 2) calcul delta
    let delta = 0;
    let qty: number | undefined = undefined;

    if (input.type === "IN" || input.type === "OUT") {
      assertPositive(input.qty, "qty");
      qty = input.qty!;
      delta = input.type === "IN" ? +qty : -qty;
    } else if (input.type === "ADJUST") {
      // ADJUST: soit countedQty, soit on supporte delta direct
      if (typeof input.countedQty === "number") {
        assertNumber(input.countedQty, "countedQty");
        // delta sera computed dans la transaction (car on a besoin du stock courant)
        delta = NaN; // placeholder
      } else {
        throw badRequest("countedQty is required for ADJUST");
      }
    } else {
      throw badRequest("Invalid type");
    }

    // console.log("createStockMovement input:", input);

    // ✅ 3) resolve unitCost (only for IN)
    // NOTE: This is outside the transaction (ok, it's just a read).
    const resolvedUnitCost = await this.resolveUnitCost({
      type: input.type,
      supplierId: input.providerId,
      supplyItemId: input.supplyItemId,
      providedUnitCost: input.unitCost,
    });

    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        // 3) récupérer StockItem (upsert)
        const stockItem = await StockItemModel.findOneAndUpdate(
          {
            orgId: input.orgId ?? undefined,
            locationId: input.locationId,
            supplyItemId: input.supplyItemId,
          },
          {
            $setOnInsert: {
              orgId: input.orgId ?? undefined,
              locationId: input.locationId,
              supplyItemId: input.supplyItemId,
              onHand: 0,
              minLevel: 0,
            },
          },
          { new: true, upsert: true, session },
        );

        const stockBefore = Number(stock_attachNumber(stockItem.onHand));

        // 4) ADJUST delta = counted - before
        if (input.type === "ADJUST") {
          const counted = input.countedQty!;
          delta = counted - stockBefore;
          // si delta = 0, tu peux choisir de ne rien écrire.
          // mais MG apprécie parfois d’avoir la trace => on garde.
        }

        const stockAfter = stockBefore + delta;

        // 5) règle stock négatif
        if (blockNegative && stockAfter < 0) {
          throw badRequest(
            `Insufficient stock. Available=${stockBefore}, requested delta=${delta}`,
          );
        }

        // 6) update stock item
        stockItem.onHand = stockAfter;
        await stockItem.save({ session });

        // 7) create movement
        const movement = await StockMovementModel.create(
          [
            {
              orgId: input.orgId ?? undefined,
              type: input.type,
              supplyItemId: input.supplyItemId,
              locationId: input.locationId,
              delta,
              qty,

              // ✅ save unit cost only for IN (resolved)
              unitCost: input.type === "IN" ? resolvedUnitCost : undefined,
              providerId: input.providerId,
              refType: input.refType,
              refId: input.refId,
              reason: input.reason,
              stockBefore,
              stockAfter,
              createdBy: input.createdBy,
            },
          ],
          { session },
        );

        return {
          stockItem,
          movement: movement[0],
        };
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async listStock(input: {
    orgId?: Types.ObjectId;
    locationId: Types.ObjectId;
    search?: string;
    belowMin?: boolean;
    limit?: number;
  }) {
    const limit = Math.min(input.limit ?? 50, 200);

    let supplyItemIds: Types.ObjectId[] | undefined;

    if (input.search?.trim()) {
      const q = normalizeLabel(input.search.trim());
      const matched = await SupplyItemEntity.find(
        { labelNormalized: { $regex: q, $options: "i" }, active: true },
        { _id: 1 },
      )
        .limit(200)
        .lean();

      supplyItemIds = matched.map((m) => m._id);
      if (!supplyItemIds.length) return { items: [], total: 0 };
    }

    const filter: any = {
      orgId: input.orgId ?? undefined,
      locationId: input.locationId,
      ...(supplyItemIds ? { supplyItemId: { $in: supplyItemIds } } : {}),
    };

    // belowMin : onHand <= minLevel
    if (input.belowMin) {
      filter.$expr = { $lte: ["$onHand", "$minLevel"] };
    }

    const items = await StockItemModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate("supplyItemId") // pour retourner label/unit
      .lean();

    return { items, total: items.length };
  }

  async setStockMinLevel(input: {
    orgId?: Types.ObjectId;
    locationId: Types.ObjectId;
    supplyItemId: Types.ObjectId;
    minLevel: number;
    updatedBy?: Types.ObjectId;
  }) {
    if (!Number.isFinite(input.minLevel) || input.minLevel < 0) {
      throw badRequest("minLevel must be a number >= 0");
    }

    const doc = await StockItemModel.findOneAndUpdate(
      {
        orgId: input.orgId ?? undefined,
        locationId: input.locationId,
        supplyItemId: input.supplyItemId,
      },
      {
        $set: { minLevel: input.minLevel },
        $setOnInsert: { onHand: 0 },
      },
      { new: true, upsert: true },
    );

    return doc;
  }
}
