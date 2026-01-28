import { Types } from "mongoose";
import { SupplyItemEntity } from "../models/supply-item.model";
import { SupplierPriceEntity } from "../models/supplier-price.model";
import { assertTransition } from "../domain/supply-plan.transitions";
import {
  SupplyPlanEntity,
  SupplyPlanStatus,
} from "../models/supplier-plan.model";
import { httpError } from "./supply-item.service";

function pad(n: number, size = 4) {
  return String(n).padStart(size, "0");
}

async function generateReference() {
  const year = new Date().getFullYear();
  // naive counter using countDocuments; OK for MVP.
  // if you want strict uniqueness under concurrency, use a Counter collection later.
  const count = await SupplyPlanEntity.countDocuments({
    createdAt: {
      $gte: new Date(`${year}-01-01T00:00:00.000Z`),
      $lte: new Date(`${year}-12-31T23:59:59.999Z`),
    },
  });
  return `AP-${year}-${pad(count + 1)}`;
}

export class SupplyPlanService {
  async list(input: {
    status?: SupplyPlanStatus;
    q?: string; // reference contains
    from?: string; // date
    to?: string; // date
    limit?: number;
    page?: number;
  }) {
    const page = Math.max(1, Number(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(input.limit ?? 20)));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (input.status) filter.status = input.status;

    if (input.q?.trim()) {
      filter.reference = { $regex: input.q.trim(), $options: "i" };
    }

    if (input.from || input.to) {
      filter.createdAt = {};
      if (input.from) filter.createdAt.$gte = new Date(input.from);
      if (input.to) filter.createdAt.$lte = new Date(input.to);
    }

    const [items, total] = await Promise.all([
      SupplyPlanEntity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SupplyPlanEntity.countDocuments(filter),
    ]);

    return { items, page, limit, total, pages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const doc = await SupplyPlanEntity.findById(id);
    if (!doc) throw httpError("Supply plan not found", 404);
    return doc;
  }

  async create(input: {
    createdByUserId: string;
    scheduledFor?: Date | null;
    department?: string | null;
    notes?: string | null;
    lines?: Array<{
      itemId: string;
      quantity: number;
      selectedSupplierId?: string | null;
      selectedUnitPrice?: number | null;
    }>;
  }) {
    const reference = await generateReference();

    const linesInput = input.lines ?? [];

    // hydrate snapshots from item
    const itemIds = linesInput.map((l) => l.itemId);
    const items = itemIds.length
      ? await SupplyItemEntity.find({ _id: { $in: itemIds } })
      : [];
    const map = new Map(items.map((i) => [String(i._id), i]));

    const lines = linesInput.map((l) => {
      const item = map.get(String(l.itemId));
      if (!item) throw httpError(`Item not found: ${l.itemId}`, 404);

      return {
        itemId: new Types.ObjectId(l.itemId),
        labelSnapshot: item.label,
        unitSnapshot: item.unit ?? null,
        quantity: Number(l.quantity ?? 0),

        selectedSupplierId: l.selectedSupplierId
          ? new Types.ObjectId(l.selectedSupplierId)
          : null,
        selectedUnitPrice:
          l.selectedUnitPrice == null ? null : Number(l.selectedUnitPrice),

        // lineTotal recalculated in pre-validate
        lineTotal: 0,
        currency: "XAF",
      };
    });

    const doc = await SupplyPlanEntity.create({
      reference,
      status: "DRAFT",
      scheduledFor: input.scheduledFor ?? null,
      department: input.department ?? null,
      notes: input.notes ?? null,
      createdByUserId: input.createdByUserId,
      lines,
      estimatedTotal: 0,
      currency: "XAF",
      attachments: [],
      history: [],
    });

    return doc;
  }

  async update(
    id: string,
    input: {
      scheduledFor?: Date | null;
      department?: string | null;
      notes?: string | null;
      lines?: Array<{
        itemId: string;
        quantity: number;
        selectedSupplierId?: string | null;
        selectedUnitPrice?: number | null;
        publishingSupplierPrices?: boolean;
      }>;
    },
  ) {
    const doc = await SupplyPlanEntity.findById(id);
    if (!doc) throw httpError("Supply plan not found", 404);

    if (["COMPLETED", "CANCELLED"].includes(doc.status)) {
      throw httpError("Impossible de modifier un plan clos/annulé.", 400);
    }

    if (input.scheduledFor !== undefined)
      doc.scheduledFor = input.scheduledFor ?? null;
    if (input.department !== undefined)
      doc.department = input.department ?? null;
    if (input.notes !== undefined) doc.notes = input.notes ?? null;

    if (input.lines) {
      const itemIds = input.lines.map((l) => l.itemId);
      const items = itemIds.length
        ? await SupplyItemEntity.find({ _id: { $in: itemIds } })
        : [];
      const map = new Map(items.map((i) => [String(i._id), i]));

      doc.lines = input.lines.map((l) => {
        const item = map.get(String(l.itemId));
        if (!item) throw httpError(`Item not found: ${l.itemId}`, 404);

        return {
          itemId: new Types.ObjectId(l.itemId),
          labelSnapshot: item.label,
          unitSnapshot: item.unit ?? null,
          quantity: Number(l.quantity ?? 0),
          selectedSupplierId: l.selectedSupplierId
            ? new Types.ObjectId(l.selectedSupplierId)
            : null,
          selectedUnitPrice:
            l.selectedUnitPrice == null ? null : Number(l.selectedUnitPrice),
          lineTotal: 0, // recalculated
          currency: "XAF",
        } as any;
      });
    }

    await doc.save();

    // ✅ Auto-feed supplier prices (safe)
    if (input.lines?.length) {
      // Option: global flag from UI (recommended)
      const publish = (input as any).publishSupplierPrices === true;

      for (const l of input.lines) {
        if (!l.selectedSupplierId) continue;
        if (l.selectedUnitPrice == null) continue;

        const supplierId = String(l.selectedSupplierId);
        const itemId = String(l.itemId);
        const unitPrice = Number(l.selectedUnitPrice);

        // rule A: only create if missing, unless publish==true
        const exists = await SupplierPriceEntity.findOne({
          supplierId: new Types.ObjectId(supplierId),
          itemId: new Types.ObjectId(itemId),
        }).select("_id unitPrice");

        if (!exists || publish) {
          await SupplierPriceEntity.findOneAndUpdate(
            {
              supplierId: new Types.ObjectId(supplierId),
              itemId: new Types.ObjectId(itemId),
            },
            {
              $set: {
                unitPrice,
                currency: "XAF",
                source: {
                  docId: String(doc._id),
                  note: !exists
                    ? "Créé depuis plan (prix manuel)"
                    : "Mis à jour depuis plan (prix manuel)",
                },
              },
            },
            { upsert: true, new: true },
          );
        }
      }
    }

    return doc;
  }

  async changeStatus(input: {
    id: string;
    to: SupplyPlanStatus;
    byUserId: string;
    note?: string;
  }) {
    const doc = await SupplyPlanEntity.findById(input.id);
    if (!doc) throw httpError("Supply plan not found", 404);

    const from = doc.status as SupplyPlanStatus;
    const to = input.to;

    assertTransition(from, to);

    doc.status = to;
    doc.history = [
      ...(doc.history || []),
      {
        at: new Date(),
        byUserId: input.byUserId,
        from,
        to,
        note: input.note,
      },
    ] as any;

    await doc.save();
    return doc;
  }

  /**
   * Auto-price:
   * For each plan line with no selectedUnitPrice:
   * - find cheapest SupplierPrice for that item
   * - set selectedSupplierId + selectedUnitPrice
   */
  async autoPrice(id: string) {
    const doc = await SupplyPlanEntity.findById(id);
    if (!doc) throw httpError("Supply plan not found", 404);

    if (["COMPLETED", "CANCELLED"].includes(doc.status)) {
      throw httpError("Plan clos/annulé: auto-pricing interdit.", 400);
    }

    const itemIds = (doc.lines || []).map((l: any) => l.itemId).filter(Boolean);
    if (!itemIds.length) return doc;

    // fetch all prices for those items
    const prices = await SupplierPriceEntity.find({
      itemId: { $in: itemIds },
    }).sort({ unitPrice: 1, updatedAt: -1 });

    // map: itemId -> best price (first due to sort)
    const best = new Map<string, any>();
    for (const p of prices) {
      const key = String(p.itemId);
      if (!best.has(key)) best.set(key, p);
    }

    let changed = false;

    doc.lines = (doc.lines || []).map((l: any) => {
      const key = String(l.itemId);
      const b = best.get(key);

      // already selected => keep snapshot
      if (l.selectedUnitPrice != null) return l;

      if (!b) return l; // no price found

      changed = true;
      return {
        ...l,
        selectedSupplierId: b.supplierId,
        selectedUnitPrice: b.unitPrice,
        currency: "XAF",
        lineTotal: 0, // recalculated by pre-validate
      };
    });

    if (changed) await doc.save();
    return doc;
  }

  async cancel(id: string, byUserId: string, note?: string) {
    // strict: just use changeStatus to CANCELLED
    return this.changeStatus({ id, to: "CANCELLED", byUserId, note });
  }
}
