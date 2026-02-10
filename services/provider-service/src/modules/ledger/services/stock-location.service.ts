// stock-location.service.ts
import { Types } from "mongoose";
import { StockLocationModel } from "../models/stock-location.model";

export async function ensureDefaultStockLocation(input?: {
  orgId?: Types.ObjectId;
  name?: string;
}) {
  const name = input?.name || "Magasin principal";

  const filter: any = {
    name,
    ...(input?.orgId ? { orgId: input.orgId } : {}),
  };

  let location = await StockLocationModel.findOne(filter);

  if (!location) {
    location = await StockLocationModel.create({
      name,
      active: true,
      orgId: input?.orgId,
    });
  }

  return location;
}

export async function getStockLocations() {
  const locations = await StockLocationModel.find();
  return locations;
}
