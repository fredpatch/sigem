import {
  Vehicle,
  VehicleDocument as VehicleDoc,
} from "src/models/vehicle.model";
import {
  CreateVehicleDTO,
  ListVehiclesQuery,
  UpdateVehicleDTO,
  UpdateVehicleMileageDTO,
} from "src/schema/vehicle.dto";
import { Types } from "mongoose";
import { VehicleStatus } from "src/types/vehicle.type";
import { response } from "@sigem/shared";
import {
  CreateVehicleDocumentInput,
  UpdateVehicleDocumentDTO,
} from "src/schema/vehicle-document.dto";
import {
  VehicleDocumentEntity,
  VehicleDocument as VehicleDocumentAttrs,
} from "src/models/vehicle-document.model";
import {
  upsertVehicleDocAndTasksRefs,
  upsertVehicleRefs,
} from "src/client/reference.client";

export class VehicleService {
  async createVehicle(payload: CreateVehicleDTO): Promise<VehicleDoc> {
    const now = new Date();

    const doc = await Vehicle.create({
      dept: payload.dept,
      plateNumber: payload.plateNumber.trim().toUpperCase(),
      brand: payload.brand.trim(),
      model: payload.model.trim(),
      type: payload.type?.trim(),
      year: payload.year,

      usageType: payload.usageType,
      energy: payload.energy,
      averageConsumption: payload.averageConsumption,
      fiscalPower: payload.fiscalPower,
      acquisitionDate: payload.acquisitionDate,
      firstRegistrationDate: payload.firstRegistrationDate,
      ownership: payload.ownership?.trim(),

      currentMileage: payload.currentMileage ?? 0,
      mileageUpdatedAt: payload.mileageUpdatedAt ?? now,

      assignedToEmployeeMatricule:
        payload.assignedToEmployeeMatricule?.trim() || undefined,
      assignedToName: payload.assignedToName?.trim() || undefined,
      assignedToDirection: payload.assignedToDirection?.trim() || undefined,
      assignedToFunction: payload.assignedToFunction?.trim() || undefined,

      status: payload.status ?? VehicleStatus.ACTIVE,
      maintenanceNotes: payload.maintenanceNotes ?? "",
    });

    await upsertVehicleRefs({
      dept: payload.dept,
      brand: payload.brand,
      model: payload.model,
      type: payload.type ?? undefined,
      ownership: payload.ownership ?? undefined,
      assignedToDirection: payload.assignedToDirection ?? undefined,
    });

    return doc;
  }

  async listVehicles(params: ListVehiclesQuery) {
    const {
      // matriculate,
      page = 1,
      limit = 10,
      status,
      search,
      assigned,
    } = params;

    const filter: Record<string, any> = {
      // matriculate,
    };

    if (status) {
      filter.status = status;
    }

    if (assigned === "yes") filter.assignedToEmployeeMatricule = { $ne: null };
    else if (assigned === "no") {
      filter.$or = [
        { assignedToEmployeeMatricule: null },
        { assignedToEmployeeMatricule: { $exists: false } },
      ];
    }

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ plateNumber: regex }, { brand: regex }, { model: regex }];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Vehicle.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);

    // console.log(items);
    return response(
      {
        items,
        total,
        page,
        limit,
      },
      null,
      "Vehicles list fetched",
      true,
      200
    );
  }

  async getVehicleById(id: string): Promise<VehicleDoc | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const vehicle = await Vehicle.findOne({
      _id: id,
      // dept,
    });

    return vehicle;
  }

  async updateVehicle(
    id: string,
    payload: UpdateVehicleDTO
  ): Promise<VehicleDoc | null> {
    // console.log(id);
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, any> = {};

    if (payload.plateNumber !== undefined) {
      update.plateNumber = payload.plateNumber.trim().toUpperCase();
    }
    if (payload.brand !== undefined) {
      update.brand = payload.brand.trim();
    }
    if (payload.model !== undefined) {
      update.model = payload.model.trim();
    }
    if (payload.type !== undefined) {
      update.type = payload.type?.trim();
    }
    if (payload.year !== undefined) {
      update.year = payload.year;
    }
    if (payload.maintenanceNotes !== undefined) {
      update.maintenanceNotes = payload.maintenanceNotes?.trim() || null;
    }

    // --- nouveaux champs ---
    if (payload.usageType !== undefined) {
      update.usageType = payload.usageType;
    }
    if (payload.energy !== undefined) {
      update.energy = payload.energy;
    }
    if (payload.averageConsumption !== undefined) {
      update.averageConsumption = payload.averageConsumption;
    }
    if (payload.fiscalPower !== undefined) {
      update.fiscalPower = payload.fiscalPower;
    }
    if (payload.acquisitionDate !== undefined) {
      update.acquisitionDate = payload.acquisitionDate;
    }
    if (payload.firstRegistrationDate !== undefined) {
      update.firstRegistrationDate = payload.firstRegistrationDate;
    }
    if (payload.ownership !== undefined) {
      update.ownership = payload.ownership?.trim();
    }

    if (payload.currentMileage !== undefined) {
      update.currentMileage = payload.currentMileage;
      update.mileageUpdatedAt = payload.mileageUpdatedAt ?? new Date();
    }

    if (payload.assignedToEmployeeMatricule === null) {
      update.assignedToEmployeeMatricule = null;
      update.assignedToName = null;
      update.assignedToDirection = null;
      update.assignedToFunction = null;
    } else if (payload.assignedToEmployeeMatricule !== undefined) {
      update.assignedToEmployeeMatricule =
        payload.assignedToEmployeeMatricule?.trim() ?? null;
    }

    if (payload.assignedToName !== undefined) {
      update.assignedToName = payload.assignedToName?.trim() ?? null;
    }

    if (payload.assignedToDirection !== undefined) {
      update.assignedToDirection = payload.assignedToDirection?.trim() ?? null;
    }

    if (payload.status !== undefined) {
      update.status = payload.status;
    }

    if (Object.keys(update).length === 0) {
      return this.getVehicleById(id);
    }

    const updated = await Vehicle.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    // --- Dictionaires --- //
    if (updated) {
      await upsertVehicleRefs({
        dept: (updated as any).dept ?? "MG",
        brand: payload.brand !== undefined ? payload.brand : undefined,
        model: payload.model !== undefined ? payload.model : undefined,
        type: payload.type !== undefined ? payload.type : undefined,
        ownership:
          payload.ownership !== undefined ? payload.ownership : undefined,
        assignedToDirection:
          payload.assignedToDirection !== undefined
            ? payload.assignedToDirection
            : undefined,
      });
    }

    return updated;
  }

  async updateVehicleMileage(
    id: string,
    payload: UpdateVehicleMileageDTO
  ): Promise<VehicleDoc | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const mileageUpdatedAt = payload.mileageUpdatedAt ?? new Date();

    return Vehicle.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          currentMileage: payload.currentMileage,
          mileageUpdatedAt,
        },
      },
      { new: true }
    ).select([
      "plateNumber",
      "brand",
      "model",
      "currentMileage",
      "mileageUpdatedAt",
    ]);
  }

  async softDeleteVehicle(id: string): Promise<VehicleDoc | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    // soft delete = on passe en INACTIVE
    return Vehicle.findOneAndUpdate(
      { _id: id },
      { $set: { status: VehicleStatus.INACTIVE } },
      { new: true }
    );
  }
}

export class VehicleDocumentService {
  async createVehicleDocument(payload: CreateVehicleDocumentInput) {
    const vehicleId = new Types.ObjectId(payload.vehicleId);

    const doc = await VehicleDocumentEntity.create({
      vehicleId,
      type: payload.type,
      reference: payload.reference?.trim(),
      issuedAt: payload.issuedAt,
      expiresAt: payload.expiresAt,
      reminderDaysBefore:
        payload.reminderDaysBefore && payload.reminderDaysBefore.length > 0
          ? payload.reminderDaysBefore
          : [30, 15, 7],
    });

    // dept via Vehicle
    const veh = await Vehicle.findById(payload.vehicleId).select(
      "dept plateNumber brand model"
    );
    const dept = (veh as any)?.dept || "MG";

    await upsertVehicleDocAndTasksRefs({
      dept,
      documentReference: doc.reference ?? undefined,
    });

    return { doc, veh };
  }

  async listVehicleDocuments(
    vehicleId: string
  ): Promise<VehicleDocumentAttrs[]> {
    if (!Types.ObjectId.isValid(vehicleId)) return [];

    return VehicleDocumentEntity.find({
      vehicleId,
    }).sort({ expiresAt: 1 });
  }

  async listAllDocuments() {
    const vehicles = await VehicleDocumentEntity.find({})
      .sort({ expiresAt: 1 })
      .populate({ path: "vehicleId", select: "plateNumber brand model" });

    return vehicles;
  }

  async getVehicleDocumentById(
    id: string
  ): Promise<VehicleDocumentAttrs | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return VehicleDocumentEntity.findById(id);
  }

  async updateVehicleDocument(
    id: string,
    payload: UpdateVehicleDocumentDTO
  ): Promise<{ updated: VehicleDocumentAttrs | null; veh: any } | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, any> = {};

    if (payload.reference !== undefined) {
      update.reference = payload.reference?.trim();
    }
    if (payload.issuedAt !== undefined) {
      update.issuedAt = payload.issuedAt;
    }
    if (payload.expiresAt !== undefined) {
      update.expiresAt = payload.expiresAt;
    }
    if (payload.reminderDaysBefore !== undefined) {
      update.reminderDaysBefore =
        payload.reminderDaysBefore?.length > 0
          ? payload.reminderDaysBefore
          : [30, 15, 7];
    }

    if (Object.keys(update).length === 0) {
      const updated = await this.getVehicleDocumentById(id);
      const veh = await Vehicle.findById(updated?.vehicleId).select(
        "dept plateNumber brand model"
      );
      return { updated, veh };
    }

    const updated = await VehicleDocumentEntity.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    const veh = await Vehicle.findById(updated?.vehicleId).select(
      "dept plateNumber brand model"
    );

    if (updated && payload.reference !== undefined) {
      const veh = await Vehicle.findById(updated.vehicleId).select(
        "dept plateNumber brand model"
      );
      const dept = (veh as any)?.dept || "MG";

      await upsertVehicleDocAndTasksRefs({
        dept,
        documentReference: updated.reference ?? undefined,
      });
    }

    return { updated, veh };
  }

  async deleteVehicleDocument(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const res = await VehicleDocumentEntity.findByIdAndDelete(id);
    return !!res;
  }
}
