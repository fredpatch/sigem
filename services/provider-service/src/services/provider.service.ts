import mongoose, { FilterQuery, Types } from "mongoose";
import { ProviderModel, ProviderDoc } from "../models/provider.model";
import {
  CreateProviderInput,
  UpdateProviderInput,
  ListProvidersQuery,
} from "../validators/provider.schema";
import { response } from "@sigem/shared";
import { PurchaseLineModel } from "../models/purchase-line.model";
import { PurchaseModel } from "../models/purchase.model";

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

type CatalogQuery = {
  providerId: string;
  q?: string;
  type?: "CONSUMABLE" | "MOBILIER" | "EQUIPEMENT" | "AUTRE";
  page: number;
  limit: number;
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
        { new: true, session },
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
        { new: true, session },
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
        .sort({ [safeSort]: sortOrder })
        .skip(skip)
        .limit(safeLimit),
      ProviderModel.countDocuments(filter),
    ]);

    return response(
      { items, page, limit, total, pages: Math.ceil(total / limit) },
      null,
      "Providers fetched successfully",
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
      "Provider stats fetched successfully",
    );
  }

  async catalog(query: CatalogQuery) {
    const providerObjectId = new Types.ObjectId(query.providerId);
    const { q, type, page, limit } = query;

    // on ne veut que les achats CONFIRMED
    // pipeline:
    // purchase_lines -> lookup purchase -> filter provider/status -> group by product
    // compute last + stats

    const matchSearch = q?.trim()
      ? {
          $or: [
            { labelSnapshot: { $regex: q.trim(), $options: "i" } },
            { codeSnapshot: { $regex: q.trim(), $options: "i" } },
          ],
        }
      : {};

    const matchType = type ? { typeSnapshot: type } : {};

    const pipeline: any[] = [
      { $match: { ...matchSearch, ...matchType } },

      // join purchase to filter by provider + status
      {
        $lookup: {
          from: PurchaseModel.collection.name, // "purchases"
          localField: "purchaseId",
          foreignField: "_id",
          as: "purchase",
        },
      },
      { $unwind: "$purchase" },

      {
        $match: {
          "purchase.providerId": providerObjectId,
          "purchase.status": "CONFIRMED",
        },
      },

      // sort by purchase date desc then createdAt desc to pick "last"
      { $sort: { "purchase.date": -1, createdAt: -1 } },

      // group per product
      {
        $group: {
          _id: "$productId",

          // snapshot fields (the latest one thanks to $sort + $first)
          label: { $first: "$labelSnapshot" },
          code: { $first: "$codeSnapshot" },
          type: { $first: "$typeSnapshot" },
          unit: { $first: "$unitSnapshot" },

          // last
          lastUnitPrice: { $first: "$unitPrice" },
          lastQuantity: { $first: "$quantity" },
          lastPurchaseDate: { $first: "$purchase.date" },
          lastPurchaseId: { $first: "$purchase._id" },

          // stats
          minUnitPrice: { $min: "$unitPrice" },
          maxUnitPrice: { $max: "$unitPrice" },
          avgUnitPrice: { $avg: "$unitPrice" },
          count: { $sum: 1 },
        },
      },

      // shape output
      {
        $project: {
          _id: 0,
          productId: "$_id",

          label: 1,
          code: 1,
          type: 1,
          unit: 1,

          last: {
            unitPrice: "$lastUnitPrice",
            quantity: "$lastQuantity",
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

      // sort by last date desc (recent first)
      { $sort: { "last.date": -1, label: 1 } },
    ];

    // pagination
    const skip = (page - 1) * limit;
    const paginated = [
      ...pipeline,
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        },
      },
    ];

    const res = await PurchaseLineModel.aggregate(paginated);
    const first = res?.[0] ?? { items: [], total: 0 };

    return response(
      {
        items: first.items,
        total: first.total,
        page,
        limit,
      },
      null,
      "Provider catalog fetched successfully",
    );
  }
}

export const providerService = new ProviderService();
