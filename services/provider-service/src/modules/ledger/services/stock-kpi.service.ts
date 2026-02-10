import { toObjectId } from "../controller/stock.controller";
import { StockItemModel } from "../models/stock-item.model";
import { StockMovementModel } from "../models/stock-movement.model";

export class StockKpiService {
  async getStockKpis(params: { locationId: string; orgId?: string }) {
    const locationId = toObjectId(params.locationId, "locationId");
    const orgId = params.orgId ? toObjectId(params.orgId, "orgId") : undefined;

    const match: any = { locationId };
    if (orgId) match.orgId = orgId;

    // 1) KPIs stock items (count/sum/belowMin)
    const itemsAgg = await StockItemModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: { $ifNull: ["$onHand", 0] } },
          belowMinCount: {
            $sum: {
              $cond: [{ $lte: ["$onHand", "$minLevel"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const base = itemsAgg?.[0] ?? {
      totalItems: 0,
      totalQuantity: 0,
      belowMinCount: 0,
    };

    // 2) last movement
    const lastMovements = await StockMovementModel.find(match)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("supplyItemId", "label unit")
      .populate("providerId", "name label")
      .lean();

    const mapped = lastMovements.map((m: any) => ({
      id: String(m._id),
      type: m.type,
      delta: m.delta,
      stockBefore: m.stockBefore,
      stockAfter: m.stockAfter,
      unitCost: m.unitCost ?? null,
      reason: m.reason ?? null,
      createdAt: m.createdAt,
      supplyItem: m.supplyItemId
        ? {
            id: String(m.supplyItemId._id),
            label: m.supplyItemId.label,
            unit: m.supplyItemId.unit,
          }
        : null,
      provider: m.providerId
        ? {
            id: String(m.providerId._id),
            name: m.providerId.name ?? m.providerId.label ?? null,
          }
        : null,
    }));

    return {
      data: {
        totalItems: base.totalItems ?? 0,
        totalQuantity: base.totalQuantity ?? 0,
        belowMinCount: base.belowMinCount ?? 0,
        lastMovementAt: mapped[0]?.createdAt ?? null,
        lastMovements: mapped,
      },
    };
  }
}
