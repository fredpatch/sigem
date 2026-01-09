import mongoose from "mongoose";
import { ProductModel } from "../models/product.model";
import { response } from "@sigem/shared";

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
}
export const productService = new ProductService();
