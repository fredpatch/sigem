import { ProviderModel } from "../../../models/provider.model";
import { SupplyPlanEntity } from "../models/supplier-plan.model";
import { SupplierPriceEntity } from "../models/supplier-price.model";
import { SupplyItemEntity } from "../models/supply-item.model";
import {
  fillStatusAmountZeros,
  fillStatusZeros,
  parseRange,
  SupplyDashboardDto,
  SupplyPlanStatus,
  toIso,
} from "../supply.helpers";

const ACTIVE_STATUSES: SupplyPlanStatus[] = [
  "SCHEDULED",
  "WAITING_QUOTE",
  "WAITING_INVOICE",
  "ORDERED",
  "DELIVERED",
];

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function fillMonthlyTrend(
  from: Date,
  to: Date,
  rows: Array<{ _id: string; count: number; amount: number }>,
) {
  const base = new Map<string, { month: string; count: number; amount: number }>();
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1));

  while (cursor <= end) {
    const key = monthKey(cursor);
    base.set(key, { month: key, count: 0, amount: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  for (const row of rows) {
    if (!row?._id) continue;
    base.set(row._id, {
      month: row._id,
      count: Number(row.count ?? 0),
      amount: Number(row.amount ?? 0),
    });
  }

  return Array.from(base.values());
}

export class SupplyDashboardService {
  async getDashboard(input?: {
    from?: string;
    to?: string;
  }): Promise<SupplyDashboardDto> {
    const { from, to } = parseRange(input);
    const planMatch = { createdAt: { $gte: from, $lte: to } };

    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const [
      plansFacet,
      topSuppliersRaw,
      topItemsRaw,
      itemsStats,
      itemsWithoutPrice,
      itemsAtRisk,
      pricesFacet,
    ] = await Promise.all([
      SupplyPlanEntity.aggregate([
        { $match: planMatch },
        {
          $facet: {
            core: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  activeCount: {
                    $sum: {
                      $cond: [{ $in: ["$status", ACTIVE_STATUSES] }, 1, 0],
                    },
                  },
                  totalAmount: { $sum: { $ifNull: ["$estimatedTotal", 0] } },
                },
              },
            ],
            byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
            byStatusAmount: [
              {
                $group: {
                  _id: "$status",
                  amount: { $sum: { $ifNull: ["$estimatedTotal", 0] } },
                },
              },
            ],
            monthlyTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m",
                      date: "$createdAt",
                    },
                  },
                  count: { $sum: 1 },
                  amount: { $sum: { $ifNull: ["$estimatedTotal", 0] } },
                },
              },
              { $sort: { _id: 1 } },
            ],
            lastCreated: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $project: {
                  id: { $toString: "$_id" },
                  reference: 1,
                  status: 1,
                  createdAt: 1,
                  amount: { $ifNull: ["$estimatedTotal", 0] },
                },
              },
            ],
            missing: [
              {
                $match: {
                  $or: [
                    { estimatedTotal: { $in: [0, null] } },
                    {
                      lines: {
                        $elemMatch: {
                          $or: [
                            { selectedUnitPrice: null },
                            { selectedUnitPrice: { $lte: 0 } },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
              { $count: "n" },
            ],
            atRisk: [
              {
                $match: {
                  status: { $in: ACTIVE_STATUSES },
                  $or: [
                    { estimatedTotal: { $in: [0, null] } },
                    {
                      lines: {
                        $elemMatch: {
                          $or: [
                            { selectedUnitPrice: null },
                            { selectedUnitPrice: { $lte: 0 } },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
              { $count: "n" },
            ],
          },
        },
      ]),

      SupplyPlanEntity.aggregate([
        { $match: planMatch },
        { $unwind: "$lines" },
        { $match: { "lines.selectedSupplierId": { $ne: null } } },
        {
          $group: {
            _id: "$lines.selectedSupplierId",
            amount: { $sum: { $ifNull: ["$lines.lineTotal", 0] } },
            plansSet: { $addToSet: "$_id" },
          },
        },
        {
          $project: {
            supplierId: { $toString: "$_id" },
            amount: 1,
            plansCount: { $size: "$plansSet" },
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 5 },
      ]),

      SupplyPlanEntity.aggregate([
        { $match: planMatch },
        { $unwind: "$lines" },
        {
          $group: {
            _id: "$lines.itemId",
            linesCount: { $sum: 1 },
            quantitySum: { $sum: { $ifNull: ["$lines.quantity", 0] } },
            amount: { $sum: { $ifNull: ["$lines.lineTotal", 0] } },
          },
        },
        {
          $project: {
            itemId: { $toString: "$_id" },
            linesCount: 1,
            quantitySum: 1,
            amount: 1,
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 5 },
      ]),

      SupplyItemEntity.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            activeCount: { $sum: { $cond: ["$active", 1, 0] } },
          },
        },
      ]),

      SupplyItemEntity.aggregate([
        { $match: { active: true } },
        {
          $lookup: {
            from: "supplierprices",
            localField: "_id",
            foreignField: "itemId",
            as: "prices",
          },
        },
        { $match: { prices: { $size: 0 } } },
        { $count: "n" },
      ]),

      SupplyItemEntity.aggregate([
        { $match: { active: true } },
        {
          $lookup: {
            from: "supplierprices",
            localField: "_id",
            foreignField: "itemId",
            as: "prices",
          },
        },
        {
          $addFields: {
            lastPriceUpdatedAt: { $max: "$prices.updatedAt" },
          },
        },
        {
          $match: {
            $or: [
              { prices: { $size: 0 } },
              { lastPriceUpdatedAt: { $lt: d30 } },
            ],
          },
        },
        { $count: "n" },
      ]),

      SupplierPriceEntity.aggregate([
        {
          $facet: {
            count: [{ $count: "n" }],
            updated7d: [
              { $match: { updatedAt: { $gte: d7 } } },
              { $count: "n" },
            ],
            updated30d: [
              { $match: { updatedAt: { $gte: d30 } } },
              { $count: "n" },
            ],
            stale: [
              { $match: { updatedAt: { $lt: d30 } } },
              { $count: "n" },
            ],
          },
        },
      ]),
    ]);

    const plansData = plansFacet?.[0] ?? {};
    const core = plansData.core?.[0] ?? {
      count: 0,
      activeCount: 0,
      totalAmount: 0,
    };
    const byStatusRows = (plansData.byStatus ?? []) as Array<{
      _id: SupplyPlanStatus;
      n: number;
    }>;
    const byStatusAmountRows = (plansData.byStatusAmount ?? []) as Array<{
      _id: SupplyPlanStatus;
      amount: number;
    }>;
    const lastCreated = (plansData.lastCreated ?? []) as Array<{
      id: string;
      reference: string;
      status: SupplyPlanStatus;
      createdAt: Date;
      amount: number;
    }>;
    const monthlyTrendRows = (plansData.monthlyTrend ?? []) as Array<{
      _id: string;
      count: number;
      amount: number;
    }>;

    const missing = Number(plansData.missing?.[0]?.n ?? 0);
    const atRiskCount = Number(plansData.atRisk?.[0]?.n ?? 0);

    const totalCount = Number(itemsStats?.[0]?.totalCount ?? 0);
    const activeCount = Number(itemsStats?.[0]?.activeCount ?? 0);
    const withoutAnySupplierPriceCount = Number(itemsWithoutPrice?.[0]?.n ?? 0);
    const itemsAtRiskCount = Number(itemsAtRisk?.[0]?.n ?? 0);
    const coveragePct =
      activeCount > 0
        ? Math.round(
            ((activeCount - withoutAnySupplierPriceCount) / activeCount) * 100,
          )
        : 0;

    const pricesData = pricesFacet?.[0] ?? {};
    const pricesCount = Number(pricesData.count?.[0]?.n ?? 0);
    const updated7d = Number(pricesData.updated7d?.[0]?.n ?? 0);
    const updated30d = Number(pricesData.updated30d?.[0]?.n ?? 0);
    const staleCount = Number(pricesData.stale?.[0]?.n ?? 0);

    const supplierIds = (topSuppliersRaw ?? []).map((x: any) => String(x.supplierId));
    const itemIds = (topItemsRaw ?? []).map((x: any) => String(x.itemId));

    const [providers, items] = await Promise.all([
      supplierIds.length
        ? ProviderModel.find({ _id: { $in: supplierIds } })
            .select({ name: 1, designation: 1 })
            .lean()
        : [],
      itemIds.length
        ? SupplyItemEntity.find({ _id: { $in: itemIds } })
            .select({ label: 1 })
            .lean()
        : [],
    ]);

    const providerMap = new Map(
      providers.map((provider: any) => [
        String(provider._id),
        provider.name ?? provider.designation ?? String(provider._id),
      ]),
    );
    const itemMap = new Map(
      items.map((item: any) => [String(item._id), item.label ?? String(item._id)]),
    );

    const topSuppliers = (topSuppliersRaw ?? []).map((x: any) => ({
      supplierId: String(x.supplierId),
      supplierName: providerMap.get(String(x.supplierId)) ?? String(x.supplierId),
      plansCount: Number(x.plansCount ?? 0),
      amount: Number(x.amount ?? 0),
    }));

    const topItems = (topItemsRaw ?? []).map((x: any) => ({
      itemId: String(x.itemId),
      label: itemMap.get(String(x.itemId)) ?? String(x.itemId),
      linesCount: Number(x.linesCount ?? 0),
      quantitySum: Number(x.quantitySum ?? 0),
      amount: Number(x.amount ?? 0),
    }));

    const totalAmount = Number(core.totalAmount ?? 0);
    const topSupplierSharePct =
      totalAmount > 0 && topSuppliers.length > 0
        ? Math.round((topSuppliers[0].amount / totalAmount) * 100)
        : 0;

    return {
      range: { from: toIso(from), to: toIso(to) },
      plans: {
        count: Number(core.count ?? 0),
        activeCount: Number(core.activeCount ?? 0),
        totalAmount,
        byStatus: fillStatusZeros(byStatusRows),
        byStatusAmount: fillStatusAmountZeros(byStatusAmountRows),
        withMissingPricesCount: missing,
        atRiskCount,
        topSupplierSharePct,
        monthlyTrend: fillMonthlyTrend(from, to, monthlyTrendRows),
        topSuppliers,
        lastCreated: lastCreated.map((x) => ({
          id: String(x.id),
          reference: String(x.reference),
          status: x.status,
          createdAt: new Date(x.createdAt).toISOString(),
          amount: Number(x.amount ?? 0),
        })),
      },
      items: {
        totalCount,
        activeCount,
        withoutAnySupplierPriceCount,
        coveragePct,
        atRiskCount: itemsAtRiskCount,
        topItems,
      },
      prices: {
        count: pricesCount,
        updated7d,
        updated30d,
        staleCount,
      },
    };
  }

  async getSideKpis(input: { days?: number }) {
    const days = Math.max(7, Math.min(365, Number(input.days ?? 30)));
    const from = new Date(Date.now() - days * 24 * 3600 * 1000);

    const activePlans = await SupplyPlanEntity.find({
      status: { $in: ACTIVE_STATUSES },
      createdAt: { $gte: from },
    }).select({ status: 1, lines: 1, createdAt: 1 });

    let activeLinesCount = 0;
    let linesMissingPrice = 0;
    const byStatus: Record<string, number> = {};
    const itemCount = new Map<string, number>();
    const supplierCount = new Map<string, number>();

    for (const p of activePlans) {
      byStatus[String(p.status)] = (byStatus[String(p.status)] ?? 0) + 1;

      for (const l of p.lines ?? []) {
        activeLinesCount++;
        const hasPrice =
          l.selectedUnitPrice != null && Number(l.selectedUnitPrice) > 0;
        if (!hasPrice) linesMissingPrice++;

        const itemId = String(l.itemId);
        itemCount.set(itemId, (itemCount.get(itemId) ?? 0) + 1);

        if (l.selectedSupplierId) {
          const sid = String(l.selectedSupplierId);
          supplierCount.set(sid, (supplierCount.get(sid) ?? 0) + 1);
        }
      }
    }

    const activeItems = await SupplyItemEntity.find({ active: true }).select({
      _id: 1,
      label: 1,
    });
    const activeItemIds = activeItems.map((i) => i._id);

    const pricedItemIds = await SupplierPriceEntity.distinct("itemId", {
      itemId: { $in: activeItemIds },
    });

    const pricedSet = new Set(pricedItemIds.map(String));
    const missingItemsCount = activeItems.filter(
      (i) => !pricedSet.has(String(i._id)),
    ).length;

    const coveragePct = activeItems.length
      ? Math.round(
          ((activeItems.length - missingItemsCount) / activeItems.length) * 100,
        )
      : 0;

    const staleLimit = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [stalePricesCount, lastUpdate] = await Promise.all([
      SupplierPriceEntity.countDocuments({ updatedAt: { $lt: staleLimit } }),
      SupplierPriceEntity.findOne({})
        .sort({ updatedAt: -1 })
        .select({ updatedAt: 1 }),
    ]);

    const itemLabelMap = new Map(
      activeItems.map((i) => [String(i._id), i.label]),
    );

    const topItems = Array.from(itemCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([itemId, count]) => ({
        itemId,
        label: itemLabelMap.get(itemId) ?? itemId,
        count,
      }));

    const topSuppliers = Array.from(supplierCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([supplierId, count]) => ({ supplierId, name: supplierId, count }));

    return {
      plans: {
        activeCount: activePlans.length,
        activeLinesCount,
        linesMissingPrice,
        byStatus,
      },
      prices: {
        coveragePct,
        missingItemsCount,
        stalePricesCount,
        lastUpdateAt: lastUpdate?.updatedAt
          ? lastUpdate.updatedAt.toISOString()
          : null,
      },
      top: {
        items: topItems,
        suppliers: topSuppliers,
      },
    };
  }
}
