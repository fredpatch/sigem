import mongoose, { FilterQuery } from "mongoose";
import { ProviderModel, ProviderDoc } from "../models/provider.model";
import {
  CreateProviderInput,
  UpdateProviderInput,
  ListProvidersQuery,
} from "../validators/provider.schema";
import { response } from "@sigem/shared";

export type ProviderStats = {
  total: number;
  byType: {
    FOURNISSEUR: number;
    PRESTATAIRE: number;
  };
  withContact: number; // tel>0 OR email>0
  withoutContact: number; // tel=0 AND email=0
  inactive: number;
  contactRate: number; // %
  lastUpdatedAt: string | null;
};

export class ProviderService {
  async create(data: CreateProviderInput) {
    const provider = new ProviderModel(data);
    await provider.save();
    // return provider;
    return response(provider, null, "Provider created successfully");
  }

  async findById(id: string) {
    return ProviderModel.findById(id);
  }

  async update(id: string, data: UpdateProviderInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const provider = await ProviderModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session,
      });
      await session.commitTransaction();
      session.endSession();
      return response(provider, null, "Provider updated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async disable(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const provider = await ProviderModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();
      return response(provider, null, "Provider disabled successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async activate(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const provider = await ProviderModel.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true, session }
      );
      await session.commitTransaction();
      session.endSession();
      return response(provider, null, "Provider activated successfully");
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async list(query: ListProvidersQuery) {
    const {
      search,
      active,
      type,
      dept,
      page,
      limit,
      sort,
      order,
      withoutContact,
    } = query;

    const filter: FilterQuery<ProviderDoc> = {};

    if (active !== undefined) filter.isActive = active;
    if (type) filter.type = type;
    if (dept) filter.dept = dept;
    if (withoutContact === true) {
      filter.$expr = {
        $and: [
          { $eq: [{ $size: { $ifNull: ["$phones", []] } }, 0] },
          { $eq: [{ $size: { $ifNull: ["$emails", []] } }, 0] },
        ],
      };
    }

    if (search) {
      filter.searchText = { $regex: search.toLowerCase(), $options: "i" };
    }

    const safePage = Math.max(1, Number(page ?? 1));
    const safeLimit = Math.min(100, Math.max(1, Number(limit ?? 10)));

    const skip = (safePage - 1) * safeLimit;

    const safeSort = sort ?? "updatedAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const [items, total] = await Promise.all([
      ProviderModel.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit),
      ProviderModel.countDocuments(filter),
    ]);

    return response(
      { items, page, limit, total, pages: Math.ceil(total / limit) },
      null,
      "Providers fetched successfully"
    );
  }

  async stats() {
    const [agg] = await ProviderModel.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                inactive: {
                  $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                },
                lastUpdatedAt: { $max: "$updatedAt" },
              },
            },
          ],
          byType: [
            {
              $group: {
                _id: "$type",
                count: { $sum: 1 },
              },
            },
          ],
          contacts: [
            {
              $project: {
                hasContact: {
                  $or: [
                    { $gt: [{ $size: { $ifNull: ["$phones", []] } }, 0] },
                    { $gt: [{ $size: { $ifNull: ["$emails", []] } }, 0] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                withContact: { $sum: { $cond: ["$hasContact", 1, 0] } },
                withoutContact: { $sum: { $cond: ["$hasContact", 0, 1] } },
              },
            },
          ],
        },
      },
    ]);

    const totals = agg?.totals?.[0] ?? {
      total: 0,
      inactive: 0,
      lastUpdatedAt: null,
    };

    const byTypeArr: Array<{
      _id: "FOURNISSEUR" | "PRESTATAIRE";
      count: number;
    }> = agg?.byType ?? [];

    const byType = {
      FOURNISSEUR: byTypeArr.find((x) => x._id === "FOURNISSEUR")?.count ?? 0,
      PRESTATAIRE: byTypeArr.find((x) => x._id === "PRESTATAIRE")?.count ?? 0,
    };

    const contacts = agg?.contacts?.[0] ?? {
      withContact: 0,
      withoutContact: 0,
    };

    const total = totals.total ?? 0;
    const contactRate =
      total > 0 ? Math.round((contacts.withContact / total) * 100) : 0;

    // console.log("ProviderService.stats - totals:", totals);
    // console.log("ProviderService.stats - byType:", byType);
    // console.log("ProviderService.stats - contacts:", contacts);
    // console.log("ProviderService.stats - contactRate:", contactRate);

    return response(
      {
        total,
        byType,
        withContact: contacts.withContact ?? 0,
        withoutContact: contacts.withoutContact ?? 0,
        inactive: totals.inactive ?? 0,
        contactRate,
        lastUpdatedAt: totals.lastUpdatedAt
          ? new Date(totals.lastUpdatedAt).toISOString()
          : null,
      },
      null,
      "Provider stats fetched successfully"
    );
  }
}

export const providerService = new ProviderService();
