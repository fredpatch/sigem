import { FilterQuery } from "mongoose";
import { Location } from "../models/location.model";
import { Asset } from "../models/asset.model";
import { response } from "@sigem/shared";
import { upsertLocationRefs } from "src/client/reference.client";

export type CreateLocationDTO = {
  localisation: string;
  batiment: string;
  direction: string;
  bureau: string;
  level?: "LOCALISATION" | "BATIMENT" | "DIRECTION" | "BUREAU";
  notes?: string;
};

export type UpdateLocationDTO = Partial<CreateLocationDTO>;

export class LocationService {
  static async list(q?: {
    search?: string;
    localisation?: string;
    batiment?: string;
    direction?: string;
    bureau?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      localisation,
      batiment,
      direction,
      bureau,
      page = 1,
      limit = 20,
    } = q || {};
    const filter: FilterQuery<any> = {};
    if (localisation) filter.localisation = localisation;
    if (batiment) filter.batiment = batiment;
    if (direction) filter.direction = direction;
    if (bureau) filter.bureau = bureau;

    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [
        { code: re },
        { path: re },
        { bureau: re },
        { direction: re },
        { localisation: re },
        { batiment: re },
      ];
    }

    const cursor = Location.find(filter)
      .sort({ localisation: 1, batiment: 1, direction: 1, bureau: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([
      cursor,
      Location.countDocuments(filter),
    ]);
    return response(
      { items, total, page, limit },
      null,
      "Locations fetched",
      true,
      200
    );
  }

  static async getById(id: string) {
    return Location.findById(id);
  }

  static async create(payload: CreateLocationDTO) {
    // normalize minimally; model will upper/derive code+path
    payload.localisation = payload.localisation.trim();
    payload.batiment = payload.batiment.trim();
    payload.direction = payload.direction.trim();
    payload.bureau = payload.bureau.trim();

    const created = await Location.create(payload);

    const dept = (created as any).dept ?? "MG"

    await upsertLocationRefs({
      dept,
      localisation: created.localisation,
      batiment: created.batiment,
      direction: created.direction,
      bureau: created.bureau
    })

    return created
  }

  static async update(id: string, payload: UpdateLocationDTO) {
    if (payload.localisation)
      payload.localisation = payload.localisation.trim();
    if (payload.batiment) payload.batiment = payload.batiment.trim();
    if (payload.direction) payload.direction = payload.direction.trim();
    if (payload.bureau) payload.bureau = payload.bureau.trim();

    // runValidators ensures enum/required constraints; pre('validate') will recompute code/path
    const updated = await Location.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      const dept = (updated as any).dept ?? "MG";

      await upsertLocationRefs({
        dept,
        localisation: payload.localisation !== undefined ? payload.localisation : null,
        batiment: payload.batiment !== undefined ? payload.batiment : null,
        direction: payload.direction !== undefined ? payload.direction : null,
        bureau: payload.bureau !== undefined ? payload.bureau : null,
      });
    }

    return updated
  }
  static async remove(id: string) {
    // (Option) ensure no assets reference this location before delete
    const count = await Asset.countDocuments({ locationId: id });
    if (count > 0) throw new Error("Cannot delete a location with assets");

    return Location.findByIdAndDelete(id);
  }
}
