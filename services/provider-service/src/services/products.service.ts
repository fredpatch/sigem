import mongoose, { Types } from "mongoose";
import { ProductModel } from "../models/product.model";
import { response } from "@sigem/shared";
import { PurchaseLineModel } from "../models/purchase-line.model";
import { PurchaseModel } from "../models/purchase.model";

export class ProductService {
  async createProduct(input: any) {
    const doc = await ProductModel.create(input);
    return response(doc.toJSON(), null, "Product created successfully");
  }

  async getProductById(id: string) {
    const doc = await ProductModel.findById(id);
    // return doc ? doc.toJSON() : null;
    return doc
      ? response(doc.toJSON(), null, "Product found successfully")
      : response(null, null, "Product not found", false);
  }

  async updateProduct(id: string, input: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const doc = await ProductModel.findById(id);
      if (!doc) return null;

      Object.assign(doc, input);
      await doc.save({ session });
      await session.commitTransaction();
      session.endSession();

      return response(doc.toJSON(), null, "Product updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async listProducts(query: {
    q?: string;
    type?: string;
    categoryId?: string;
    dept?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }) {
    const { q, type, categoryId, dept, isActive, page, limit } = query;

    const filter: any = {};
    if (type) filter.type = type;
    if (categoryId) filter.categoryId = categoryId;
    if (dept) filter.dept = dept;
    if (typeof isActive === "boolean") filter.isActive = isActive;

    if (q?.trim()) {
      // regex sur searchText comme Provider
      filter.searchText = { $regex: q.trim().toLowerCase(), $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort({ label: 1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    return response(
      {
        items: items.map((i) => i.toJSON()),
        page,
        limit,
        total,
      },
      null,
      "Products listed successfully"
    );
  }

  async compareProductPrices(params: {
    productId: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit: number;
  }) {
    const productObjectId = new Types.ObjectId(params.productId);

    const dateMatch: any = {};
    if (params.dateFrom) dateMatch.$gte = params.dateFrom;
    if (params.dateTo) dateMatch.$lte = params.dateTo;

    const pipeline: any[] = [
      { $match: { productId: productObjectId } },

      {
        $lookup: {
          from: PurchaseModel.collection.name,
          localField: "purchaseId",
          foreignField: "_id",
          as: "purchase",
        },
      },
      { $unwind: "$purchase" },

      {
        $match: {
          "purchase.status": "CONFIRMED",
          ...(Object.keys(dateMatch).length
            ? { "purchase.date": dateMatch }
            : {}),
        },
      },

      // sort recent first, so $first is "last"
      { $sort: { "purchase.date": -1, createdAt: -1 } },

      {
        $group: {
          _id: "$purchase.providerId",

          providerId: { $first: "$purchase.providerId" },

          // latest snapshot
          label: { $first: "$labelSnapshot" },
          code: { $first: "$codeSnapshot" },
          type: { $first: "$typeSnapshot" },
          unit: { $first: "$unitSnapshot" },

          lastUnitPrice: { $first: "$unitPrice" },
          lastPurchaseDate: { $first: "$purchase.date" },
          lastPurchaseId: { $first: "$purchase._id" },

          minUnitPrice: { $min: "$unitPrice" },
          maxUnitPrice: { $max: "$unitPrice" },
          avgUnitPrice: { $avg: "$unitPrice" },
          count: { $sum: 1 },
        },
      },

      // join provider info
      {
        $lookup: {
          from: "providers",
          localField: "providerId",
          foreignField: "_id",
          as: "provider",
        },
      },
      { $unwind: "$provider" },

      {
        $project: {
          _id: 0,
          provider: {
            id: "$provider._id",
            name: "$provider.name",
            designation: "$provider.designation",
            type: "$provider.type",
          },

          product: {
            label: "$label",
            code: "$code",
            type: "$type",
            unit: "$unit",
          },

          last: {
            unitPrice: "$lastUnitPrice",
            date: "$lastPurchaseDate",
            purchaseId: "$lastPurchaseId",
          },
          stats: {
            min: "$minUnitPrice",
            max: "$maxUnitPrice",
            avg: { $round: ["$avgUnitPrice", 0] },
            count: "$count",
          },
        },
      },

      // best price first (min), tie-breaker recent
      { $sort: { "last.unitPrice": 1, "last.date": -1 } },

      { $limit: params.limit },
    ];

    const items = await PurchaseLineModel.aggregate(pipeline);
    return response(
      items,
      null,
      "Product price comparison retrieved successfully"
    );
  }
}
export const productService = new ProductService();
