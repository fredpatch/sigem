import { FilterQuery } from "mongoose";
import { Category } from "../models/category.model";
import { response } from "@sigem/shared";
import { upsertCategoryRefs } from "src/client/reference.client";

export type CreateCategoryDTO = {
  label: string; // ex. "Ordinateur complet"
  family: "EQUIPEMENT" | "INFORMATIQUE" | "MOBILIER";
  parentId?: string | null; // null => catégorie racine (famille)
  description?: string;
  allowedChildren?: string[]; // refs Category
  active?: boolean; // (optionnel si tu veux soft-disable)
};

export type UpdateCategoryDTO = Partial<{
  label: string;
  family: "EQUIPEMENT" | "INFORMATIQUE" | "MOBILIER";
  parentId: string | null;
  description: string;
  allowedChildren: string[];
  active: boolean;
}>;

export class CategoryService {
  static async list(q?: {
    search?: string;
    family?: CreateCategoryDTO["family"];
    parentId?: string | null;
    page?: number;
    limit?: number;
  }) {
    const { search, family, parentId, page = 1, limit = 20 } = q || {};
    const filter: FilterQuery<any> = {};
    if (family) filter.family = family;
    if (parentId === null) filter.parentId = null;
    else if (typeof parentId === "string") filter.parentId = parentId;

    if (search) {
      const re = new RegExp(search, "i");
      // searchable natural keys (code/canonicalPrefix are auto but can be searched)
      filter.$or = [{ code: re }, { label: re }, { canonicalPrefix: re }];
    }

    const cursor = Category.find(filter)
      .sort({ family: 1, parentId: 1, label: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([
      cursor,
      Category.countDocuments(filter),
    ]);
    return response(
      { items, total, page, limit },
      null,
      "Categories fetched",
      true,
      200
    );
  }

  static async getById(id: string) {
    return Category.findById(id);
  }

  /**
   * Create category with minimal input.
   * - If parentId is null/undefined => root family (node)
   * - If parentId provided => sub-category (coerces family to parent.family)
   * - code/canonicalPrefix are auto-filled by the model pre('validate')
   */
  static async create(payload: CreateCategoryDTO) {
    // normalize
    payload.label = payload.label.trim();
    if (payload.parentId === undefined) payload.parentId = null;


    // coherence checks
    if (payload.parentId) {
      const parent = await Category.findById(payload.parentId).select(
        "family parentId"
      );
      if (!parent) throw new Error("Parent category not found");
      if (parent.parentId !== null)
        throw new Error("Parent must be a root family");

      // enforce family from parent (ignore client-provided mismatch)
      payload.family = parent.family as CreateCategoryDTO["family"];
    }

    // simple create (model will auto-fill code & canonicalPrefix)
    const created = await Category.create(payload);

    const dept = (created as any).dept ?? "MG"

    await upsertCategoryRefs({ dept, label: typeof created.label === 'string' ? created.label : undefined })

    return created
  }

  /**
   * Idempotent upsert for sub-category (optional helper).
   * Useful if you want to avoid duplicates by (parentId, label) and just return the created/existing sub-cat.
   */
  static async upsertSubcategory(parentId: string, label: string) {
    label = label.trim();

    const parent = await Category.findById(parentId).select("family parentId");
    if (!parent) throw new Error("Parent category not found");
    if (parent.parentId !== null)
      throw new Error("Parent must be a root family");

    const sub = await Category.findOneAndUpdate(
      { parentId, label },
      {
        $setOnInsert: {
          parentId,
          label,
          family: parent.family,
        },
      },
      { new: true, upsert: true }
    );
    return sub!;
  }

  /**
   * Update:
   * - We DO NOT allow changing code/canonicalPrefix directly (they are derived by the model).
   * - If parent/family change, enforce coherence (family must match root parent's family).
   */
  static async update(id: string, payload: UpdateCategoryDTO) {
    if (payload.label) payload.label = payload.label.trim();

    if (payload.parentId !== undefined || payload.family !== undefined) {
      const target = await Category.findById(id);
      if (!target) throw new Error("Category not found");

      const nextParentId =
        payload.parentId !== undefined ? payload.parentId : target.parentId;
      const nextFamily =
        payload.family !== undefined ? payload.family : target.family;

      if (nextParentId) {
        const parent =
          await Category.findById(nextParentId).select("family parentId");
        if (!parent) throw new Error("Parent category not found");
        if (parent.parentId !== null)
          throw new Error("Parent must be a root family");
        if (parent.family !== nextFamily)
          throw new Error("Family must match parent.family");
      }
    }

    // Important: do NOT accept manual updates to code/canonicalPrefix
    // If you still want to silently ignore them:
    // delete (payload as any).code;
    // delete (payload as any).canonicalPrefix;

    const updated = await Category.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (updated && payload.label !== undefined) {
      const dept = (updated as any).dept ?? "MG"
      await upsertCategoryRefs({ dept, label: payload.label })
    }

    return updated
  }

  static async remove(id: string) {
    // forbid deletion if has children
    const childrenCount = await Category.countDocuments({ parentId: id });
    if (childrenCount > 0)
      throw new Error("Cannot delete a category that has children");

    // (optional) forbid deletion if assets reference this category
    // const assetsCount = await Asset.countDocuments({ categoryId: id });
    // if (assetsCount > 0)
    //   throw new Error("Cannot delete category referenced by assets");

    return Category.findByIdAndDelete(id);
  }
}
