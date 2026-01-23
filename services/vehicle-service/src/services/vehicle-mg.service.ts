import { Types } from "mongoose";
import { VehicleDocumentEntity } from "src/models/vehicle-document.model";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { Vehicle } from "src/models/vehicle.model";
import { createRenewalTaskForDocument } from "src/schema/bootstrap-doc-task";
import {
  DOC_KEY_TO_TYPE,
  MgCreateVehicleDTO,
} from "src/schema/mg-vehicle-create.dto";
import { OPEN_STATUSES, statusRank } from "src/types/mg.types";
import { VehicleTaskType } from "src/types/vehicle-task-template.type";

type DocKey = keyof typeof DOC_KEY_TO_TYPE;
type DocPayload = NonNullable<MgCreateVehicleDTO["documents"]>[DocKey];

export class MgService {
  private readonly OPEN_STATUSES = OPEN_STATUSES;
  private readonly taskType = VehicleTaskType;
  private vehicleEntity = VehicleTaskEntity;

  async findOpenOilChangeTask(params: { vehicleId: string; dept?: string }) {
    const { vehicleId, dept } = params;

    if (!Types.ObjectId.isValid(vehicleId)) return null;

    const tasks = await this.vehicleEntity
      .find({
        vehicleId: new Types.ObjectId(vehicleId),
        type: this.taskType.OIL_CHANGE,
        status: { $in: this.OPEN_STATUSES as unknown as string[] },
      })
      .select("_id dept dueAt dueMileage createdAt")
      .lean();

    if (!tasks?.length) return null;

    // sort by status urgency then dueMileage/ dueAt
    tasks.sort((a: any, b: any) => {
      const sr = statusRank(a.status) - statusRank(b.status);
      if (sr !== 0) return sr;

      const aKm =
        typeof a.dueMileage === "number"
          ? a.dueMileage
          : Number.POSITIVE_INFINITY;
      const bKm =
        typeof b.dueMileage === "number"
          ? b.dueMileage
          : Number.POSITIVE_INFINITY;

      if (aKm !== bKm) return aKm - bKm;

      const aAt = a.dueAt
        ? new Date(a.dueAt).getTime()
        : Number.POSITIVE_INFINITY;
      const bAt = b.dueAt
        ? new Date(b.dueAt).getTime()
        : Number.POSITIVE_INFINITY;

      if (aAt !== bAt) return aAt - bAt;

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return tasks[0]; // { _id, ... }
  }
  async createMgVehicle(input: any, dept: string) {
    // 1) Create vehicle
    const createdVehicle = await Vehicle.create({
      ...input.vehicle,
      dept,
      // default safety
      currentMileage: input.vehicle.currentMileage ?? 0,
      mileageUpdatedAt: input.vehicle.mileageUpdatedAt ?? new Date(),
    });

    const vehicleId = createdVehicle._id.toString();

    // 2) Create docs (optional)
    const docsCreated: any[] = [];
    const tasksCreated: any[] = [];

    const docs = input.documents;
    const keys = Object.keys(DOC_KEY_TO_TYPE) as DocKey[];

    for (const key of keys) {
      const docPayload = docs?.[key] as DocPayload | undefined;
      if (!docPayload) continue;

      const type = DOC_KEY_TO_TYPE[key];

      const doc = await VehicleDocumentEntity.create({
        vehicleId: createdVehicle._id,
        type,
        provider: docPayload.provider,
        reference: docPayload.reference,
        issuedAt: docPayload.issuedAt,
        expiresAt: docPayload.expiresAt,
        reminderDaysBefore: [30, 15, 7],
        notificationsCount: 0,
      });

      docsCreated.push(doc);

      const task = await createRenewalTaskForDocument({
        dept,
        vehicleId,
        vehicleDocumentId: doc._id.toString(),
        documentType: type,
        dueAt: doc.expiresAt,
      });

      tasksCreated.push(task);
    }

    return {
      vehicle: createdVehicle.toJSON(),
      documents: docsCreated.map((d) => ({ ...d, id: d._id?.toString?.() })),
      tasks: tasksCreated.map((t) => ({ ...t, id: t._id?.toString?.() })),
    };
  }
}
