// stock-location.service.ts
import { Types } from "mongoose";
import { StockLocationModel } from "../models/stock-location.model";

export async function ensureDefaultStockLocation(input?: {
  orgId?: Types.ObjectId;
  name?: string;
}) {
  const name = input?.name || "Magasin principal";

  const scopeFilter: any = input?.orgId ? { orgId: input.orgId } : {};

  const existing = await StockLocationModel.findOne(scopeFilter)
    .sort({ createdAt: 1 })
    .lean();

  if (existing) {
    return existing;
  }

  try {
    const created = await StockLocationModel.create({
      name,
      active: true,
      orgId: input?.orgId,
    });

    return created;
  } catch (error: any) {
    if (error?.code === 11000) {
      const concurrent = await StockLocationModel.findOne({
        name,
        ...scopeFilter,
      })
        .sort({ createdAt: 1 })
        .lean();

      if (concurrent) return concurrent;
    }

    throw error;
  }
}

export async function getStockLocations(input?: { orgId?: Types.ObjectId }) {
  await ensureDefaultStockLocation(input);

  const filter: any = input?.orgId ? { orgId: input.orgId } : {};
  const locations = await StockLocationModel.find(filter).sort({ createdAt: 1 });
  return locations;
}
