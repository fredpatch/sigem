import { Types } from "mongoose";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { OPEN_STATUSES, statusRank } from "src/types/mg.types";
import { VehicleTaskType } from "src/types/vehicle-task-template.type";

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
}
