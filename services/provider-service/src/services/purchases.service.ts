import { response } from "@sigem/shared";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model";
import { PurchaseModel } from "../models/purchase.model";
import { PurchaseLineModel } from "../models/purchase-line.model";

export class PurchasesService {
  async createPurchase(input: {
    providerId: string;
    date: Date;
    reference?: string;
    status?: "DRAFT" | "CONFIRMED" | "CANCELLED";
    currency?: string;
    dept?: string;
    notes?: string;
    tags?: string[];
    tax?: number;
    discount?: number;
    lines: Array<{
      productId: string;
      unitPrice: number;
      quantity: number;
      notes?: string;
    }>;
    createdBy?: string;
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1) Charger les products pour snapshot
      const productIds = input.lines.map((l) => l.productId);
      const products = await ProductModel.find({
        _id: { $in: productIds },
      }).session(session);
      const map = new Map(products.map((p) => [String(p._id), p]));

      // 2) Créer Purchase (totals après lignes)
      const purchase = await PurchaseModel.create(
        [
          {
            providerId: input.providerId,
            date: input.date,
            reference: input.reference,
            status: input.status ?? "CONFIRMED",
            currency: input.currency ?? "XAF",
            dept: input.dept,
            notes: input.notes,
            tags: input.tags ?? [],
            tax: input.tax ?? 0,
            discount: input.discount ?? 0,
            createdBy: input.createdBy,
          },
        ],
        { session }
      );

      const purchaseDoc = purchase[0];

      // 3) Créer les lignes avec snapshot
      const lineDocs = input.lines.map((l) => {
        const p = map.get(String(l.productId));
        if (!p) {
          const err = new Error(`Product not found: ${l.productId}`);
          (err as any).status = 400;
          throw err;
        }

        return {
          purchaseId: purchaseDoc._id,
          productId: p._id,

          labelSnapshot: p.label,
          codeSnapshot: p.code,
          typeSnapshot: p.type,
          unitSnapshot: p.unit,

          unitPrice: l.unitPrice,
          quantity: l.quantity,
          notes: l.notes,
        };
      });

      const createdLines = await PurchaseLineModel.insertMany(lineDocs, {
        session,
      });

      // 4) Totals
      const subtotal = createdLines.reduce(
        (sum, l) => sum + Number(l.lineTotal ?? 0),
        0
      );
      const discount = Number(purchaseDoc.discount ?? 0);
      const tax = Number(purchaseDoc.tax ?? 0);
      const total = Math.max(0, Math.round(subtotal - discount + tax));

      purchaseDoc.subtotal = subtotal;
      purchaseDoc.total = total;
      await purchaseDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return response(
        {
          purchase: purchaseDoc.toJSON(),
          lines: createdLines.map((l) => l.toJSON()),
        },
        null,
        "Purchase created successfully",
        true,
        201
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updatePurchase(id: string, input: any) {
    const purchase = await PurchaseModel.findById(id);
    if (!purchase)
      return response(null, null, "Purchase not found", false, 404);

    if (purchase.status !== "DRAFT") {
      const err = new Error(
        "Seul les achats au statut 'Brouillon' peuvent être modifiés."
      );
      (err as any).status = 400;
      throw err;
    }

    Object.assign(purchase, input);
    await purchase.save();

    return response(
      purchase.toJSON(),
      null,
      "Purchase updated successfully",
      true,
      200
    );
  }

  async cancelPurchase(id: string) {
    const purchase = await PurchaseModel.findById(id);
    if (!purchase)
      return response(null, null, "Purchase not found", false, 404);

    if (purchase.status === "CANCELLED")
      return response(
        purchase.toJSON(),
        null,
        "Purchase is already cancelled",
        true,
        200
      );

    purchase.status = "CANCELLED";
    await purchase.save();

    return response(
      purchase.toJSON(),
      null,
      "Purchase cancelled successfully",
      true,
      200
    );
  }

  async confirmPurchase(id: string) {
    const purchase = await PurchaseModel.findById(id);
    if (!purchase)
      return response(null, null, "Purchase not found", false, 404);

    if (purchase.status === "CANCELLED") {
      const err = new Error("Un achat annulé ne peut pas être confirmé.");
      (err as any).status = 400;
      throw err;
    }

    // idempotent
    if (purchase.status === "CONFIRMED") {
      return response(
        purchase.toJSON(),
        null,
        "Purchase already confirmed",
        true,
        200
      );
    }

    // 1) load lines
    const lines = await PurchaseLineModel.find({
      purchaseId: purchase._id,
    }).lean();

    if (!lines.length) {
      const err = new Error("Impossible de confirmer un achat sans lignes.");
      (err as any).status = 400;
      throw err;
    }

    // 2) recompute lineTotal (important if created via insertMany/updateMany)
    const bulk = lines.map((l: any) => {
      const unitPrice = Number(l.unitPrice ?? 0);
      const quantity = Number(l.quantity ?? 0);
      const lineTotal = Math.round(unitPrice * quantity);

      return {
        updateOne: {
          filter: { _id: l._id },
          update: { $set: { lineTotal } },
        },
      };
    });

    if (bulk.length) await PurchaseLineModel.bulkWrite(bulk);

    // 3) compute totals
    const subtotal = lines.reduce((sum: number, l: any) => {
      const unitPrice = Number(l.unitPrice ?? 0);
      const quantity = Number(l.quantity ?? 0);
      return sum + Math.round(unitPrice * quantity);
    }, 0);

    const discount = Number(purchase.discount ?? 0);
    const tax = Number(purchase.tax ?? 0);

    purchase.subtotal = Math.round(subtotal);
    purchase.total = Math.max(0, Math.round(subtotal - discount + tax));

    // 4) lock
    purchase.status = "CONFIRMED";
    await purchase.save();

    return response(
      purchase.toJSON(),
      null,
      "Purchase confirmed successfully",
      true,
      200
    );
  }

  async listPurchases(query: any) {
    const { q, providerId, dept, status, dateFrom, dateTo, page, limit } =
      query;

    const filter: any = {};
    if (providerId) filter.providerId = providerId;
    if (dept) filter.dept = dept;
    if (status) filter.status = status;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    if (q?.trim()) {
      filter.searchText = { $regex: q.trim().toLowerCase(), $options: "i" };
    }

    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: filter },
      { $sort: { date: -1, createdAt: -1 } },

      // join provider (same as populate but in agg)
      {
        $lookup: {
          from: "providers",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      { $unwind: { path: "$provider", preserveNullAndEmptyArrays: true } },

      // summary lines
      {
        $lookup: {
          from: "purchaselines",
          let: { pid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$purchaseId", "$$pid"] } } },
            {
              $project: {
                labelSnapshot: 1,
                quantity: 1,
              },
            },
            { $sort: { createdAt: 1 } }, // pour “top” stable
          ],
          as: "lines",
        },
      },
      {
        $addFields: {
          linesCount: { $size: "$lines" },
          totalQuantity: { $sum: "$lines.quantity" },
          topItems: {
            $slice: [
              {
                $map: {
                  input: "$lines",
                  as: "l",
                  in: "$$l.labelSnapshot",
                },
              },
              2,
            ],
          },
        },
      },

      // cleanup payload
      {
        $project: {
          lines: 0, // on ne renvoie pas toutes les lignes
          "provider._id": 0,
          "provider.__v": 0,
          "provider.createdAt": 0,
          "provider.updatedAt": 0,
        },
      },

      // pagination + total in one go
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
      {
        $addFields: {
          total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
        },
      },
      {
        $project: {
          items: 1,
          total: 1,
        },
      },
    ];

    const agg = await PurchaseModel.aggregate(pipeline);
    const result = agg?.[0] ?? { items: [], total: 0 };

    // ⚠️ retours id comme string
    const items = (result.items ?? []).map((it: any) => ({
      ...it,
      id: String(it._id),
      providerId: it.providerId ? String(it.providerId) : undefined,
      provider: it.provider
        ? {
            id: String(it.provider._id),
            name: it.provider.name,
            designation: it.provider.designation,
            type: it.provider.type,
          }
        : null,
    }));

    return response(
      { items, page, limit, total: result.total },
      null,
      "Purchases retrieved successfully",
      true,
      200
    );
  }

  async getPurchaseDetail(id: string) {
    const purchase = await PurchaseModel.findById(id)
      .populate("providerId", "name designation type")
      .lean();

    if (!purchase)
      return response(null, null, "Purchase not found", false, 404);

    const lines = await PurchaseLineModel.find({ purchaseId: id })
      .sort({ createdAt: 1 })
      .lean();

    return response(
      { purchase, lines },
      null,
      "Purchase detail retrieved successfully",
      true,
      200
    );
  }
}
