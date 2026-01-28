// supply-dashboard.service.ts

import { SupplyPlanEntity } from "../models/supplier-plan.model";
import { SupplierPriceEntity } from "../models/supplier-price.model";
import { SupplyItemEntity } from "../models/supply-item.model";
import {
  fillStatusZeros,
  parseRange,
  SupplyDashboardDto,
  SupplyPlanStatus,
  toIso,
} from "../supply.helpers";

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
      topSuppliers,
      topItems,
      itemsStats,
      itemsWithoutPrice,
      pricesFacet,
    ] = await Promise.all([
      // 1) Plans: core, byStatus, lastCreated, missing
      SupplyPlanEntity.aggregate([
        { $match: planMatch },
        {
          $facet: {
            core: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  totalAmount: { $sum: { $ifNull: ["$estimatedTotal", 0] } },
                },
              },
            ],
            byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
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
                    { "lines.selectedUnitPrice": null },
                  ],
                },
              },
              { $count: "n" },
            ],
          },
        },
      ]),

      // 2) Top suppliers by amount (from plan lines)
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

      // 3) Top items by amount/usage (from plan lines)
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

      // 4) Items stats (total/active)
      SupplyItemEntity.aggregate([
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            activeCount: { $sum: { $cond: ["$active", 1, 0] } },
          },
        },
      ]),

      // 5) Items active without any supplier price
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

      // 6) Prices stats
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
          },
        },
      ]),
    ]);

    const plansData = plansFacet?.[0] ?? {};
    const core = plansData.core?.[0] ?? { count: 0, totalAmount: 0 };
    const byStatusRows = (plansData.byStatus ?? []) as Array<{
      _id: SupplyPlanStatus;
      n: number;
    }>;

    const missing = plansData.missing?.[0]?.n ?? 0;
    const lastCreated = (plansData.lastCreated ?? []) as any[];

    const totalCount = itemsStats?.[0]?.totalCount ?? 0;
    const activeCount = itemsStats?.[0]?.activeCount ?? 0;
    const withoutAnySupplierPriceCount = itemsWithoutPrice?.[0]?.n ?? 0;
    const coveragePct =
      activeCount > 0
        ? Math.round(
            ((activeCount - withoutAnySupplierPriceCount) / activeCount) * 100,
          )
        : 0;

    const pricesData = pricesFacet?.[0] ?? {};
    const pricesCount = pricesData.count?.[0]?.n ?? 0;
    const updated7d = pricesData.updated7d?.[0]?.n ?? 0;
    const updated30d = pricesData.updated30d?.[0]?.n ?? 0;

    return {
      range: { from: toIso(from), to: toIso(to) },
      plans: {
        count: Number(core.count ?? 0),
        totalAmount: Number(core.totalAmount ?? 0),
        byStatus: fillStatusZeros(byStatusRows),
        withMissingPricesCount: Number(missing ?? 0),
        topSuppliers: (topSuppliers ?? []).map((x: any) => ({
          supplierId: String(x.supplierId),
          plansCount: Number(x.plansCount ?? 0),
          amount: Number(x.amount ?? 0),
        })),
        lastCreated: (lastCreated ?? []).map((x: any) => ({
          id: String(x.id),
          reference: String(x.reference),
          status: x.status as SupplyPlanStatus,
          createdAt: new Date(x.createdAt).toISOString(),
          amount: Number(x.amount ?? 0),
        })),
      },
      items: {
        totalCount,
        activeCount,
        withoutAnySupplierPriceCount,
        coveragePct,
        topItems: (topItems ?? []).map((x: any) => ({
          itemId: String(x.itemId),
          linesCount: Number(x.linesCount ?? 0),
          quantitySum: Number(x.quantitySum ?? 0),
          amount: Number(x.amount ?? 0),
        })),
      },
      prices: {
        count: pricesCount,
        updated7d,
        updated30d,
      },
    };
  }

  async getSideKpis(input: { days?: number }) {
    const days = Math.max(7, Math.min(365, Number(input.days ?? 30)));
    const from = new Date(Date.now() - days * 24 * 3600 * 1000);

    const ACTIVE_STATUSES: SupplyPlanStatus[] = [
      "SCHEDULED",
      "WAITING_QUOTE",
      "WAITING_INVOICE",
      "ORDERED",
      "DELIVERED",
    ];

    // 1) Plans actifs
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

    // 2) Couverture des prix (items actifs vs prix existants)
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

    // 3) Prix obsolètes + dernière MAJ
    const staleLimit = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [stalePricesCount, lastUpdate] = await Promise.all([
      SupplierPriceEntity.countDocuments({ updatedAt: { $lt: staleLimit } }),
      SupplierPriceEntity.findOne({})
        .sort({ updatedAt: -1 })
        .select({ updatedAt: 1 }),
    ]);

    // 4) Top items/suppliers (enrichir labels)
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

    // Option: enrichir fournisseurs via ProviderEntity si accessible ici.
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
