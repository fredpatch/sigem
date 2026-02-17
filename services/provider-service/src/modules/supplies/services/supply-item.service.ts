import { SupplyItemEntity } from "../models/supply-item.model";
import { normalizeLabel } from "../supply.helpers";

export function httpError(message: string, status = 400) {
  const err = new Error(message) as any;
  err.status = status;
  return err;
}

export class SupplyItemService {
  async list(input: {
    search?: string;
    active?: boolean;
    limit?: number;
    page?: number;
  }) {
    const page = Math.max(1, Number(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(input.limit ?? 20)));
    const skip = (page - 1) * limit;

    const filter: any = {};
    // if (typeof input.active === "boolean") filter.active = input.active;

    if (input.search?.trim()) {
      const q = normalizeLabel(input.search);
      // simple contains on normalized label (no regex on raw label to avoid accents issues)
      filter.labelNormalized = { $regex: q, $options: "i" };
    }

    const [items, total] = await Promise.all([
      SupplyItemEntity.find(filter).sort({ label: 1 }).skip(skip).limit(limit),
      SupplyItemEntity.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const doc = await SupplyItemEntity.findById(id);
    if (!doc) throw httpError("Supply item not found", 404);
    return doc;
  }

  async create(input: {
    label: string;
    unit?: string | null;
    active?: boolean;
  }) {
    const label = (input.label || "").trim();
    if (label.length < 2) throw httpError("Label is required");

    const labelNormalized = normalizeLabel(label);

    const exists = await SupplyItemEntity.findOne({ labelNormalized });
    if (exists) throw httpError("Cet article existe déjà (doublon).", 409);

    const doc = await SupplyItemEntity.create({
      label,
      unit: input.unit ?? "UNIT",
      active: typeof input.active === "boolean" ? input.active : true,
      labelNormalized,
    });

    return doc;
  }

  async update(
    id: string,
    input: { label?: string; unit?: any | null; active?: boolean },
  ) {
    const doc = await SupplyItemEntity.findById(id);
    if (!doc) throw httpError("Supply item not found", 404);

    if (typeof input.label === "string") {
      const label = input.label.trim();
      if (label.length < 2) throw httpError("Label is invalid");
      const labelNormalized = normalizeLabel(label);

      // check duplicates
      const dup = await SupplyItemEntity.findOne({
        _id: { $ne: doc._id },
        labelNormalized,
      });
      if (dup) throw httpError("Un autre article a déjà ce nom.", 409);

      doc.label = label;
      (doc as any).labelNormalized = labelNormalized;
    }

    if (input.unit !== undefined) doc.unit = input.unit ?? "UNIT";
    if (typeof input.active === "boolean") doc.active = input.active;

    await doc.save();
    return doc;
  }

  async disable(id: string) {
    const doc = await SupplyItemEntity.findById(id);
    if (!doc) throw httpError("Supply item not found", 404);
    doc.active = false;
    await doc.save();
    return doc;
  }

  async enable(id: string) {
    const doc = await SupplyItemEntity.findById(id);
    if (!doc) throw httpError("Supply item not found", 404);
    doc.active = true;
    await doc.save();
    return doc;
  }
}
