import { toObjectId } from "../controller/stock.controller";
import { StockItemModel } from "../models/stock-item.model";
import { StockMovementModel } from "../models/stock-movement.model";

export class StockKpiService {
  async getStockKpis(params: { locationId: string; orgId?: string }) {
    const locationId = toObjectId(params.locationId, "locationId");
    const orgId = params.orgId ? toObjectId(params.orgId, "orgId") : undefined;

    const match: any = { locationId };
    if (orgId) match.orgId = orgId;

    // Date helpers
    const now = new Date();

    // last 30 days
    const from30d = new Date(now);
    from30d.setDate(now.getDate() - 30);

    // start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

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

    // 3) Movement breakdown 30d (IN vs OUT + adjust count)
    const breakdown30dAgg = await StockMovementModel.aggregate([
      { $match: { ...match, createdAt: { $gte: from30d } } },
      {
        $group: {
          _id: "$type",
          qtySum: { $sum: { $ifNull: ["$qty", 0] } }, // IN/OUT
          count: { $sum: 1 }, // ADJUST count
        },
      },
    ]);

    const breakdown30d = breakdown30dAgg.reduce(
      (acc: any, x: any) => {
        if (x._id === "IN") acc.inQty = x.qtySum ?? 0;
        if (x._id === "OUT") acc.outQty = x.qtySum ?? 0;
        if (x._id === "ADJUST") acc.adjustCount = x.count ?? 0;
        return acc;
      },
      { inQty: 0, outQty: 0, adjustCount: 0 },
    );

    // 4) Current month summary
    const monthAgg = await StockMovementModel.aggregate([
      { $match: { ...match, createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: "$type",
          qtySum: { $sum: { $ifNull: ["$qty", 0] } },
          deltaSum: { $sum: { $ifNull: ["$delta", 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthSummary = monthAgg.reduce(
      (acc: any, x: any) => {
        acc.movementsCount += x.count ?? 0;
        acc.net += x.deltaSum ?? 0; // net basé sur delta (inclut ADJUST)
        if (x._id === "IN") acc.inQty = x.qtySum ?? 0;
        if (x._id === "OUT") acc.outQty = x.qtySum ?? 0;
        return acc;
      },
      { month: monthKey, inQty: 0, outQty: 0, net: 0, movementsCount: 0 },
    );

    // 5) Stock value estimation (qty × last IN unitCost)
    // 5.1 get all stock items for location
    const stockItems = await StockItemModel.find(match)
      .select({ supplyItemId: 1, onHand: 1 })
      .lean();

    // 5.2 last IN cost per item (latest IN with unitCost)
    const lastCostAgg = await StockMovementModel.aggregate([
      {
        $match: {
          ...match,
          type: "IN",
          unitCost: { $type: "number" },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$supplyItemId",
          lastUnitCost: { $first: "$unitCost" },
          lastCostAt: { $first: "$createdAt" },
        },
      },
    ]);

    const costMap = new Map<string, number>();
    for (const c of lastCostAgg) {
      if (c?._id) costMap.set(String(c._id), Number(c.lastUnitCost ?? 0));
    }

    let totalValueXaf = 0;
    let itemsValued = 0;
    let itemsMissingCost = 0;

    for (const it of stockItems) {
      const onHand = Number(it.onHand ?? 0);
      if (!(onHand > 0)) continue;

      const cost = costMap.get(String(it.supplyItemId));
      if (typeof cost === "number" && Number.isFinite(cost) && cost > 0) {
        totalValueXaf += onHand * cost;
        itemsValued += 1;
      } else {
        itemsMissingCost += 1;
      }
    }

    const stockValue = { totalValueXaf, itemsValued, itemsMissingCost };

    // 6) Below min top (for sidebar / future dashboard)
    const belowMinTop = await StockItemModel.find({
      ...match,
      $expr: { $lte: ["$onHand", "$minLevel"] },
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("supplyItemId", "label unit")
      .lean();

    const belowMinTopMapped = belowMinTop.map((x: any) => ({
      stockItemId: String(x._id),
      supplyItemId: x.supplyItemId?._id ? String(x.supplyItemId._id) : null,
      label: x.supplyItemId?.label ?? "Article",
      unit: x.supplyItemId?.unit ?? null,
      onHand: Number(x.onHand ?? 0),
      minLevel: Number(x.minLevel ?? 0),
    }));

    return {
      data: {
        totalItems: base.totalItems ?? 0,
        totalQuantity: base.totalQuantity ?? 0,
        belowMinCount: base.belowMinCount ?? 0,

        lastMovementAt: mapped[0]?.createdAt ?? null,
        lastMovements: mapped,

        movementBreakdown30d: breakdown30d,
        monthSummary,
        stockValue,
        belowMinTop: belowMinTopMapped,
      },
    };
  }
}
