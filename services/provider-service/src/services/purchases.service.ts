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

    const [items, total] = await Promise.all([
      PurchaseModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("providerId", "name designation type")
        .lean(),
      PurchaseModel.countDocuments(filter),
    ]);

    return response(
      { items, page, limit, total },
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
