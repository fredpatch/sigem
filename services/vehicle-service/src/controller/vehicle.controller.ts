import { response } from "@sigem/shared";
import { Types } from "mongoose";
import { Request } from "express";
import { getEventBus } from "src/core/events";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { Vehicle } from "src/models/vehicle.model";
import {
  CreateVehicleDocumentInput,
  UpdateVehicleDocumentDTO,
} from "src/schema/vehicle-document.dto";
import {
  CreateVehicleDTO,
  ListVehiclesQuery,
  UpdateVehicleDTO,
  UpdateVehicleMileageDTO,
} from "src/schema/vehicle.dto";
import {
  VehicleDocumentService,
  VehicleService,
} from "src/services/vehicle.service";
import { catchError } from "src/utils/catch-error";
import { getMatriculationFromReq } from "src/utils/get.matricule";
import {
  getDoneKm,
  getDueKm,
  getIntervalKm,
  normalizeStatus,
} from "src/utils/helpers";
import { VehicleTaskType } from "src/types/vehicle-task-template.type";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";
import { VehicleTaskTemplateEntity } from "src/models/vehicle-task-template.model";
import { getMGMaintenanceTable } from "src/services/vehicle.mg-table.service";

export interface ActorInfo {
  id?: string;
  username?: string;
  sessionId?: string;
  role?: string;
  // dept?: string;
}

const OIL_INTERVAL_KM_DEFAULT = 1000;
const DUE_SOON_THRESHOLD_KM = 100;

function getActor(req: Request): ActorInfo {
  // If the service reconstructs req.user later, this takes priority
  const user = (req as any).user || {};

  return {
    id: user.id || (req.headers["x-user-id"] as string | undefined),

    username:
      user.username || (req.headers["x-user-username"] as string | undefined),

    sessionId:
      user.sessionId || (req.headers["x-user-sessionid"] as string | undefined),

    role: user.role || (req.headers["x-user-role"] as string | undefined),

    // dept: user.dept || (req.headers["x-user-dept"] as string | undefined),
  };
}

export class VehicleController {
  private vehicle = new VehicleService();

  oilChangeInfo = catchError(async (req, res) => {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).select([
      "currentMileage",
      "plateNumber",
      "brand",
      "model",
      "energy",
      "usageType",
    ]);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const vehicleId = new Types.ObjectId(id);

    // 1) récupérer la prochaine tâche VIDANGE "active"
    // On cible le code visible côté MG: CADENCE_VIDANGES / VIDANGE (selon ton data)
    const nextTask = await VehicleTaskEntity.findOne({
      vehicleId, // ou vehicle: vehicleId selon ton schema
      type: VehicleTaskType.OIL_CHANGE, // <-- clé
      status: {
        $in: [
          VehicleTaskStatus.PLANNED,
          VehicleTaskStatus.DUE_SOON,
          VehicleTaskStatus.OVERDUE,
        ],
      },
    }).sort({
      dueMileage: 1, // la plus proche
      dueAt: 1,
      createdAt: -1,
    });

    if (!nextTask || typeof nextTask.dueMileage !== "number") {
      return res.json({
        intervalKm: OIL_INTERVAL_KM_DEFAULT,
        nextDueKm: null,
        remainingKm: null,
        status: "UNKNOWN",
        taskId: null,
        currentMileage: vehicle.currentMileage ?? 0,
      });
    }

    // ✅ interval : template.everyKm si lié, sinon default 1000
    let intervalKm = OIL_INTERVAL_KM_DEFAULT;
    let noticeKmBefore = 100;

    if (nextTask.templateId && Types.ObjectId.isValid(nextTask.templateId)) {
      const tpl = await VehicleTaskTemplateEntity.findById(nextTask.templateId)
        .select(["everyKm", "noticeKmBefore"])
        .lean();

      if (tpl?.everyKm) intervalKm = tpl.everyKm;
      if (typeof tpl?.noticeKmBefore === "number")
        noticeKmBefore = tpl.noticeKmBefore;
    }

    const currentMileage = vehicle.currentMileage ?? 0;
    const nextDueKm = nextTask.dueMileage;
    const remainingKm = nextDueKm - currentMileage;

    // ✅ status calculé côté API (aligné MG)
    const computedStatus = normalizeStatus(remainingKm, noticeKmBefore);

    // ✅ 2) dernière vidange complétée (optionnel affichage)
    const lastDone = await VehicleTaskEntity.findOne({
      vehicleId,
      type: VehicleTaskType.OIL_CHANGE,
      status: { $in: [VehicleTaskStatus.COMPLETED] },
    }).sort({ completedAt: -1, updatedAt: -1, createdAt: -1 });

    return res.json({
      intervalKm,
      nextDueKm,
      remainingKm,
      status: computedStatus, // PLANNED | DUE_SOON | OVERDUE
      taskId: String(nextTask._id),
      currentMileage,
      lastDoneKm: lastDone?.completedMileage ?? undefined,
      lastDoneAt: lastDone?.completedAt ?? undefined,
    });
  });

  create = catchError(async (req, res) => {
    const actor = getActor(req);
    const matriculation = getMatriculationFromReq(req);
    if (!matriculation) {
      return res
        .status(400)
        .json(response(null, null, "Matriculation is required", false, 400));
    }

    const payload = { ...(req.body as CreateVehicleDTO), matriculation };

    const created = await this.vehicle.createVehicle(payload);

    await getEventBus().emit("vehicle.created", {
      severity: "success",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      resourceType: "Vehicle",
      userId: actor.id,
      vehiclePlate: created.plateNumber,
      vehicleBrand: created.brand,
      vehicleModel: created.model,
      issuedAt: created.createdAt.toString(),
      currentMileage: created.currentMileage.toString(),
    });

    return res.status(201).json({ data: created });
  });

  list = catchError(async (req, res) => {
    const { page, limit, status, search, assigned } = req.query as any;

    const params: ListVehiclesQuery = {
      // matriculate: getMatriculationFromReq(req),
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as any,
      search: search as string | undefined,
      assigned: assigned as "yes" | "no" | undefined,
    };

    // console.log("PARAMS", params);

    const result = await this.vehicle.listVehicles(params);

    // listVehicles renvoie déjà un `response(...)`
    return res.status(200).json(result);
  });

  listMyVehicles = catchError(async (req, res) => {
    const user = (req as any).user as { matriculation?: string };
    if (!user?.matriculation) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const items = await Vehicle.find({
      assignedToEmployeeMatricule: user.matriculation,
      status: "ACTIVE",
    })
      .sort({ updatedAt: -1 })
      .select([
        "plateNumber",
        "brand",
        "model",
        "type",
        "year",
        "energy",
        "usageType",
        "currentMileage",
        "mileageUpdatedAt",
        "assignedToName",
        "assignedToDirection",
        "assignedToFunction",
      ]);

    return res
      .status(200)
      .json(response(items, null, "My vehicles fetched", true, 200));
  });

  listById = catchError(async (req, res) => {
    const { id } = req.params;
    const vehicle = await this.vehicle.getVehicleById(id);

    if (!vehicle) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle not found", false, 404));
    }

    return res
      .status(200)
      .json(response(vehicle, null, "Vehicle fetched", true, 200));
  });

  update = catchError(async (req, res) => {
    const { id } = req.params;
    const payload = req.body as UpdateVehicleDTO;
    const actor = getActor(req);

    const updated = await this.vehicle.updateVehicle(id, payload);

    if (!updated) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle not found", false, 404));
    }

    await getEventBus().emit("vehicle.updated", {
      severity: "warning",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      resourceType: "Vehicle",
      userId: actor.id,
      vehiclePlate: updated.plateNumber,
      vehicleBrand: updated.brand,
      vehicleModel: updated.model,
      vehicleId: id,
    });

    return res
      .status(200)
      .json(response(updated, null, "Vehicle updated", true, 200));
  });
  softDelete = catchError(async (req, res) => {
    const { id } = req.params;
    const actor = getActor(req);

    const updated = await this.vehicle.softDeleteVehicle(id);

    if (!updated) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle not found", false, 404));
    }

    await getEventBus().emit("vehicle.deleted", {
      severity: "warning",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      resourceType: "Vehicle",
      userId: actor.id,
      vehiclePlate: updated.plateNumber,
      vehicleBrand: updated.brand,
      vehicleModel: updated.model,
      vehicleId: id,
    });

    return res
      .status(200)
      .json(response(updated, null, "Vehicle deactivated", true, 200));
  });

  updateMileage = catchError(async (req, res) => {
    const { id } = req.params;
    const payload = req.body as UpdateVehicleMileageDTO;

    const updated = await this.vehicle.updateVehicleMileage(id, payload);

    if (!updated) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle not found", false, 404));
    }

    return res
      .status(200)
      .json(response(updated, null, "Mileage updated", true, 200));
  });

  getMgTable = catchError(async (req, res) => {
    const dept = (req.query.dept as string) || "MG";
    const rows = await getMGMaintenanceTable(String(dept));
    return res
      .status(200)
      .json(response(rows, null, "MG Maintenance Table fetched", true, 200));
  });
}

export class VehicleDocumentController {
  private document = new VehicleDocumentService();

  create = catchError(async (req, res) => {
    const { vehicleId } = req.params;
    const actor = getActor(req);

    const payload: CreateVehicleDocumentInput = {
      ...(req.body as any),
      vehicleId,
    };

    const { doc, veh } = await this.document.createVehicleDocument(payload);
    if (!doc) {
      return res
        .status(500)
        .json(
          response(null, null, "Error creating vehicle document", false, 500)
        );
    }

    await getEventBus().emit("vehicle.document.created", {
      severity: "info",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      userId: actor.id,
      resourceType: "VehicleDocument",
      vehicleId: veh?._id,
      vehicleBrand: veh?.brand,
      vehicleModel: veh?.model,
      vehiclePlate: veh?.plateNumber,
      documentType: doc.type,
      expiresAt: doc.expiresAt,
    });

    return res
      .status(201)
      .json(
        response(doc, null, "Vehicle document created successfully", true, 201)
      );
  });

  listByVehicle = catchError(async (req, res) => {
    const { vehicleId } = req.params;

    const docs = await this.document.listVehicleDocuments(vehicleId);

    return res
      .status(200)
      .json(response(docs, null, "Vehicle documents fetched", true, 200));
  });

  list = catchError(async (req, res) => {
    const docs = await this.document.listAllDocuments();

    return res
      .status(200)
      .json(response(docs, null, "Documents fetched", true, 200));
  });

  getById = catchError(async (req, res) => {
    const { id } = req.params;

    const doc = await this.document.getVehicleDocumentById(id);

    if (!doc) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle document not found", false, 404));
    }

    return res
      .status(200)
      .json(response(doc, null, "Vehicle document fetched", true, 200));
  });

  update = catchError(async (req, res) => {
    const { id } = req.params;
    const payload = req.body as UpdateVehicleDocumentDTO;
    const actor = getActor(req);

    // console.log("Updating vehicle document", id, payload, actor);

    const result = await this.document.updateVehicleDocument(id, payload);

    if (!result || !result.updated) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle document not found", false, 404));
    }

    const { updated, veh } = result;

    console.log("Vehicle:", veh);

    await getEventBus().emit("vehicle.document.updated", {
      severity: "info",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      resourceType: "VehicleDocument",
      userId: actor.id,
      vehicleId: updated.vehicleId,
      vehicleBrand: veh?.brand,
      vehicleModel: veh?.model,
      vehiclePlate: veh?.plateNumber,
      documentType: updated.type,
      expiresAt: updated.expiresAt,
    });

    return res
      .status(200)
      .json(response(updated, null, "Vehicle document updated", true, 200));
  });

  delete = catchError(async (req, res) => {
    const { id } = req.params;
    const actor = getActor(req);

    const ok = await this.document.deleteVehicleDocument(id);

    if (!ok) {
      return res
        .status(404)
        .json(response(null, null, "Vehicle document not found", false, 404));
    }

    await getEventBus().emit("vehicle.document.deleted", {
      severity: "info",
      // role: "MG_COS",
      role: "SUPER_ADMIN",
      resourceType: "VehicleDocument",
      documentId: id,
      userId: actor.id,
    });

    return res
      .status(200)
      .json(response(null, null, "Vehicle document deleted", true, 200));
  });
}
