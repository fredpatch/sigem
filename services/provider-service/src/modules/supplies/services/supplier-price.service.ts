import { Types } from "mongoose";
import { SupplierPriceEntity } from "../models/supplier-price.model";
import { httpError } from "./supply-item.service";

export class SupplierPriceService {
  async list(input: {
    supplierId?: string;
    itemId?: string;
    limit?: number;
    page?: number;
  }) {
    const page = Math.max(1, Number(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(input.limit ?? 20)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (input.supplierId)
      filter.supplierId = new Types.ObjectId(input.supplierId);
    if (input.itemId) filter.itemId = new Types.ObjectId(input.itemId);

    const [items, total] = await Promise.all([
      SupplierPriceEntity.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      SupplierPriceEntity.countDocuments(filter),
    ]);

    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const doc = await SupplierPriceEntity.findById(id);
    if (!doc) throw httpError("Supplier price not found", 404);
    return doc;
  }

  async create(input: {
    supplierId: string;
    itemId: string;
    unitPrice: number;
    currency?: "XAF";
    source?: { docId?: string; note?: string };
  }) {
    const unitPrice = Number(input.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0)
      throw httpError("Invalid unitPrice");

    // (supplierId,itemId) is unique, so duplicate will throw
    const doc = await SupplierPriceEntity.create({
      supplierId: new Types.ObjectId(input.supplierId),
      itemId: new Types.ObjectId(input.itemId),
      unitPrice,
      currency: "XAF",
      source: input.source,
    });

    return doc;
  }

  /**
   * Upsert by (supplierId,itemId)
   * - If exists: update unitPrice/source
   * - Else: create
   */
  async upsert(input: {
    supplierId: string;
    itemId: string;
    unitPrice: number;
    source?: { docId?: string; note?: string };
  }) {
    const unitPrice = Number(input.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0)
      throw httpError("Invalid unitPrice");

    const supplierId = new Types.ObjectId(input.supplierId);
    const itemId = new Types.ObjectId(input.itemId);

    const doc = await SupplierPriceEntity.findOneAndUpdate(
      { supplierId, itemId },
      {
        $set: {
          unitPrice,
          currency: "XAF",
          source: input.source,
        },
      },
      { new: true, upsert: true },
    );

    return doc;
  }

  async update(
    id: string,
    input: { unitPrice?: number; source?: { docId?: string; note?: string } },
  ) {
    const doc = await SupplierPriceEntity.findById(id);
    if (!doc) throw httpError("Supplier price not found", 404);

    if (input.unitPrice !== undefined) {
      const unitPrice = Number(input.unitPrice);
      if (!Number.isFinite(unitPrice) || unitPrice < 0)
        throw httpError("Invalid unitPrice");
      doc.unitPrice = unitPrice;
    }

    if (input.source !== undefined) doc.source = input.source;

    await doc.save();
    return doc;
  }

  async remove(id: string) {
    const doc = await SupplierPriceEntity.findByIdAndDelete(id);
    if (!doc) throw httpError("Supplier price not found", 404);
    return doc;
  }
}
