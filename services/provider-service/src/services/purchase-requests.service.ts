import mongoose from "mongoose";
import { PurchaseRequestModel } from "../models/purchase-request.model";
import { ProductModel } from "../models/product.model";
import { PurchaseRequestLineModel } from "../models/purchase-request-line.model";
import { response } from "@sigem/shared";
import { assertTransition } from "../utils/assert";
import { PurchasesService } from "./purchases.service";

export class PurchaseRequestsService {
  private purchaseService = new PurchasesService();

  async createRequest(input: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productIds = input.lines.map((l: any) => l.productId);
      const products = await ProductModel.find({
        _id: { $in: productIds },
      }).session(session);
      const map = new Map(products.map((p) => [String(p._id), p]));

      const reqDocArr = await PurchaseRequestModel.create(
        [
          {
            title: input.title,
            reference: input.reference,
            dept: input.dept,
            providerId: input.providerId,
            neededAt: input.neededAt,
            notes: input.notes,
            tags: input.tags ?? [],
            currency: input.currency ?? "XAF",
            status: "DRAFT",
            requestedBy: input.requestedBy,
          },
        ],
        { session }
      );

      const reqDoc = reqDocArr[0];

      const lineDocs = input.lines.map((l: any) => {
        const p = map.get(String(l.productId));
        if (!p) {
          const err = new Error(`Product not found: ${l.productId}`);
          (err as any).status = 400;
          throw err;
        }

        return {
          requestId: reqDoc._id,
          productId: p._id,
          labelSnapshot: p.label,
          codeSnapshot: p.code,
          typeSnapshot: p.type,
          unitSnapshot: p.unit,
          quantity: l.quantity,
          unitPriceEstimated: l.unitPriceEstimated ?? 0,
          notes: l.notes,
        };
      });

      const createdLines = await PurchaseRequestLineModel.insertMany(lineDocs, {
        session,
      });

      const subtotalEstimated = createdLines.reduce(
        (sum, l) => sum + Number(l.lineTotalEstimated ?? 0),
        0
      );

      reqDoc.subtotalEstimated = subtotalEstimated;
      await reqDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return response(
        {
          request: reqDoc.toJSON(),
          lines: createdLines.map((l) => l.toJSON()),
        },
        null,
        "Purchase request created successfully"
      );
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  }

  async getRequestDetail(id: string) {
    const request = await PurchaseRequestModel.findById(id).populate(
      "providerId",
      "name designation type"
    );
    //   .lean();

    if (!request) return null;

    const lines = await PurchaseRequestLineModel.find({ requestId: id }).sort({
      createdAt: 1,
    });
    //   .lean();

    return response(
      { request, lines },
      null,
      "Purchase request fetched successfully"
    );
  }

  async listRequests(query: any) {
    const { q, dept, providerId, status, page, limit } = query;

    const filter: any = {};
    if (dept) filter.dept = dept;
    if (providerId) filter.providerId = providerId;
    if (status) filter.status = status;

    if (q?.trim()) {
      filter.searchText = { $regex: q.trim().toLowerCase(), $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      PurchaseRequestModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("providerId", "name designation type"),
      // .lean(),
      PurchaseRequestModel.countDocuments(filter),
    ]);

    return response(
      { items, page, limit, total },
      null,
      "Purchase requests fetched successfully"
    );
  }

  async transitionRequest(id: string, action: string, actor?: string) {
    const req = await PurchaseRequestModel.findById(id);
    if (!req)
      return response(
        null,
        "Not found",
        "Purchase transition request not found",
        false,
        404
      );

    assertTransition(req.status, action);

    const now = new Date();

    if (action === "submit") req.status = "SUBMITTED";
    if (action === "approve") {
      req.status = "APPROVED";
      req.approvedAt = now;
      if (actor) req.approvedBy = new mongoose.Types.ObjectId(actor);
    }
    if (action === "reject") req.status = "REJECTED";
    if (action === "order") req.status = "ORDERED";
    if (action === "receive") req.status = "RECEIVED";
    if (action === "cancel") req.status = "CANCELLED";

    await req.save();
    return response(
      req.toJSON(),
      null,
      "Purchase transition request updated successfully"
    );
  }

  /**
   * Convertit une Request RECEIVED -> Purchase CONFIRMED
   * - nécessite providerId
   * - reprend les lignes (qty) et laisse l'UI saisir unitPrice réel si besoin
   *   => ici on utilise unitPriceEstimated comme défaut, mais tu peux exiger unitPrice réel côté UI.
   */
  async convertRequestToPurchase(
    requestId: string,
    input: {
      providerId?: string;
      date?: Date;
      reference?: string;
      dept?: string;
      tax?: number;
      discount?: number;
    }
  ) {
    const detail = await this.getRequestDetail(requestId);
    if (!detail) return null;

    const { request, lines } = detail as any;

    if (request.status !== "RECEIVED") {
      const err = new Error(
        "Only RECEIVED requests can be converted to Purchase"
      );
      (err as any).status = 400;
      throw err;
    }

    const providerId = input.providerId ?? request.providerId;
    if (!providerId) {
      const err = new Error(
        "providerId is required to convert request to purchase"
      );
      (err as any).status = 400;
      throw err;
    }

    // create purchase using estimated prices as default
    const payload = {
      providerId: String(providerId),
      date: input.date ? new Date(input.date) : new Date(),
      reference: input.reference ?? request.reference,
      status: "CONFIRMED" as const,
      currency: request.currency ?? "XAF",
      dept: input.dept ?? request.dept,
      notes: request.notes,
      tags: request.tags ?? [],
      tax: input.tax ?? 0,
      discount: input.discount ?? 0,
      lines: (lines ?? []).map((l: any) => ({
        productId: String(l.productId),
        unitPrice: Number(l.unitPriceEstimated ?? 0),
        quantity: Number(l.quantity ?? 0),
        notes: l.notes,
      })),
    };

    const created = await this.purchaseService.createPurchase(payload as any);

    // Mark request as converted (on peut ajouter un champ purchaseId si tu veux)
    await PurchaseRequestModel.findByIdAndUpdate(requestId, {
      $set: { status: "CONVERTED" },
    });
    // Note: je le mets CANCELLED pour éviter double conversion.
    // Alternative meilleure: ajouter status "CONVERTED" + purchaseId.

    return response(
      created.data,
      null,
      "Purchase created from request successfully"
    );
  }
}
