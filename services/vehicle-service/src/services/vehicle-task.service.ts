import { Types } from "mongoose";
import { upsertVehicleDocAndTasksRefs } from "src/client/reference.client";
import { VehicleDocumentEntity } from "src/models/vehicle-document.model";
import { VehicleTaskTemplateEntity } from "src/models/vehicle-task-template.model";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { Vehicle } from "src/models/vehicle.model";
import {
  CompleteVehicleTaskDTO,
  CreateVehicleTaskDTO,
  CreateVehicleTaskTemplateDTO,
  ListVehicleTasksQuery,
  UpdateVehicleTaskDTO,
  UpdateVehicleTaskTemplateDTO,
} from "src/schema/vehicle-task.dto";
import { VehicleTaskTemplate } from "src/types/vehicle-task-template.type";
import { VehicleTask, VehicleTaskStatus } from "src/types/vehicle-task.types";
import { generateTemplateCode } from "src/utils/gen-code";
import { computeNextFromTemplate } from "src/utils/helpers";

export class VehicleTaskTemplateService {
  async createTemplate(
    payload: CreateVehicleTaskTemplateDTO
  ): Promise<VehicleTaskTemplate> {
    const label = payload.label.trim();
    const code = generateTemplateCode(payload.type, label);

    const requiresDocument = payload.requiresDocument ?? false;

    const doc = await VehicleTaskTemplateEntity.create({
      dept: payload.dept,
      code,
      label,
      description: payload.description?.trim(),
      type: payload.type,
      triggerType: payload.triggerType,
      everyKm: payload.everyKm,
      everyMonths: payload.everyMonths,
      noticeKmBefore: payload.noticeKmBefore ?? 500,
      noticeDaysBefore: payload.noticeDaysBefore ?? 14,
      defaultSeverity: payload.defaultSeverity ?? "warning",
      active: payload.active ?? true,
      requiresDocument: requiresDocument,
      documentType: requiresDocument ? (payload.documentType ?? null) : null,
    });

    await upsertVehicleDocAndTasksRefs({
      dept: payload.dept,
      templateLabel: doc.label,
    });

    return doc;
  }

  async listTemplates(onlyActive?: boolean) {
    const filter: Record<string, any> = {};

    if (onlyActive === true) {
      filter.active = true;
    }

    const items = await VehicleTaskTemplateEntity.find(filter).sort({
      code: 1,
    });

    return items;
  }

  async getTemplateById(id: string): Promise<VehicleTaskTemplate | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return VehicleTaskTemplateEntity.findOne({ _id: id });
  }

  async updateTemplate(
    id: string,
    dept: string,
    payload: UpdateVehicleTaskTemplateDTO
  ): Promise<VehicleTaskTemplate | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, any> = {};

    if (payload.label !== undefined) {
      update.label = payload.label?.trim();
    }
    if (payload.description !== undefined) {
      update.description = payload.description?.trim();
    }
    if (payload.type !== undefined) {
      update.type = payload.type;
    }
    if (payload.triggerType !== undefined) {
      update.triggerType = payload.triggerType;
    }
    if (payload.everyKm !== undefined) {
      update.everyKm = payload.everyKm;
    }
    if (payload.everyMonths !== undefined) {
      update.everyMonths = payload.everyMonths;
    }
    if (payload.noticeKmBefore !== undefined) {
      update.noticeKmBefore = payload.noticeKmBefore;
    }
    if (payload.noticeDaysBefore !== undefined) {
      update.noticeDaysBefore = payload.noticeDaysBefore;
    }
    if (payload.defaultSeverity !== undefined) {
      update.defaultSeverity = payload.defaultSeverity;
    }
    if (payload.requiresDocument !== undefined) {
      update.requiresDocument = payload.requiresDocument;

      // si on décoche "lié à un document", on nettoie documentType
      if (payload.requiresDocument === false) {
        update.documentType = null;
      }
    }
    if (payload.documentType !== undefined) {
      update.documentType = payload.documentType;
    }
    if (payload.active !== undefined) {
      update.active = payload.active;
    }

    if (Object.keys(update).length === 0) {
      return this.getTemplateById(id);
    }

    const updated = await VehicleTaskTemplateEntity.findOneAndUpdate(
      { _id: id, dept },
      { $set: update },
      { new: true }
    );

    if (updated && payload.label !== undefined) {
      await upsertVehicleDocAndTasksRefs({
        dept,
        templateLabel: updated?.label,
      });
    }

    return updated;
  }
}

type VehicleUpdate = Record<string, any>;

export class VehicleTaskService {
  private buildVehicleUpdateFromTask(params: {
    template: any;
    existing: any;
    payload: CompleteVehicleTaskDTO;
    completedAt: Date;
    nextDueAt: Date | null;
    nextDueMileage: number | null;
    vehicleCurrentMileage: number | null;
  }): VehicleUpdate {
    const {
      template,
      existing,
      payload,
      completedAt,
      nextDueAt,
      nextDueMileage,
      vehicleCurrentMileage,
    } = params;

    const update: VehicleUpdate = {};

    // 1) Mettre à jour le km du véhicule s'il est connu
    const completedMileage =
      payload.completedMileage ?? existing.completedMileage ?? null;

    if (completedMileage !== null) {
      // On considère que le km complété reflète l'état actuel
      update.currentMileage = completedMileage;

      // Si tu veux, tu peux garder celle de la tâche comme "milepost"
      update.mileageUpdatedAt = completedAt;
    }

    // 2) Logique spécifique selon le type de tâche
    // switch (template.type) {
    //   case "OIL_CHANGE":
    //     // dernière vidange = km de complétion
    //     if (completedMileage !== null) {
    //       update.lastOilChangeKm = completedMileage;
    //     }
    //     // prochaine vidange (en km) = ce que t'a donné computeNextFromTemplate
    //     if (nextDueMileage !== null) {
    //       update.nextOilChangeKm = nextDueMileage;
    //     }
    //     break;

    //   case "TECH_INSPECTION":
    //     // dernière visite technique = date de complétion
    //     update.lastTechnicalVisitDate = completedAt;
    //     // prochaine visite = date calculée
    //     if (nextDueAt) {
    //       update.nextTechnicalVisitDate = nextDueAt;
    //     } else {
    //       // si pas de nextDueAt, on peut aussi la nuller
    //       // update.nextTechnicalVisitDate = null;
    //     }
    //     break;

    //   case "DOCUMENT_RENEWAL":
    //     // valide jusqu'à la prochaine échéance
    //     if (nextDueAt) {
    //       update.insuranceValidity = nextDueAt;
    //     }
    //     break;

    //   case "EXTINGUISHER_CARD":
    //     if (nextDueAt) {
    //       update.extinguisherCardValidity = nextDueAt;
    //     }
    //     break;

    //   default:
    //     // autres types → pas d'effet spécifique sur le véhicule pour l'instant
    //     break;
    // }

    return update;
  }

  /**
   * Création d'une tâche pour un véhicule.
   * - Si templateId est fourni: on hydrate à partir du template.
   * - Sinon: on prend ce qui est passé dans le payload.
   */
  async createTask(payload: CreateVehicleTaskDTO): Promise<VehicleTask> {
    const vehicleId = new Types.ObjectId(payload.vehicleId);

    let base: Partial<VehicleTask> = {
      dept: payload.dept,
      vehicleId: vehicleId.toString(),
      status: VehicleTaskStatus.PLANNED,
      notificationsCount: 0,
    } as any;

    let vehicleDocumentId: Types.ObjectId | undefined;

    if (payload.templateId) {
      const template = await VehicleTaskTemplateEntity.findOne({
        _id: payload.templateId,
        dept: payload.dept,
        active: true,
      });

      if (!template) {
        throw new Error("Template not found or inactive");
      }

      if (template.requiresDocument) {
        if (!payload.vehicleDocumentId) {
          throw new Error(
            "A vehicleDocumentId is required for this type of task (template requiresDocument=true)"
          );
        }

        // Vérifier que le document existe et appartient bien au même véhicule + dept
        const doc = await VehicleDocumentEntity.findOne({
          _id: payload.vehicleDocumentId,
          vehicleId,
          // dept: payload.dept, // si tu stockes dept sur VehicleDocument
        });

        if (!doc) {
          throw new Error(
            "Vehicle document not found or does not belong to the specified vehicle"
          );
        }

        vehicleDocumentId = doc._id;
      }

      base = {
        ...base,
        templateId: template._id.toString(),
        type: template.type,
        triggerType: template.triggerType,
        label: payload.label?.trim() ?? template.label,
        description: payload.description?.trim() ?? template.description,
        severity: payload.severity ?? template.defaultSeverity,
        dueAt: payload.dueAt,
        dueMileage: payload.dueMileage,
      };
    } else {
      // Tâche manuelle: tous les champs nécessaires doivent être dans le payload
      if (!payload.type || !payload.triggerType || !payload.label) {
        throw new Error(
          "type, triggerType and label are required when no templateId is provided"
        );
      }

      base = {
        ...base,
        type: payload.type,
        triggerType: payload.triggerType,
        label: payload.label.trim(),
        description: payload.description?.trim(),
        dueAt: payload.dueAt,
        dueMileage: payload.dueMileage,
        severity: payload.severity ?? "warning",
      };
    }

    const doc = await VehicleTaskEntity.create({
      ...base,
      vehicleId,
      vehicleDocumentId,
    });

    await upsertVehicleDocAndTasksRefs({
      dept: payload.dept,
      templateLabel: doc.label,
    });

    return doc;
  }

  async listTasks(params: ListVehicleTasksQuery) {
    const {
      page = 1,
      limit = 100,
      status,
      severity,
      vehicleId,
      type,
      dueAfter,
      dueBefore,
    } = params;

    const filter: Record<string, any> = {};

    if (status) {
      if (status === "OPEN") {
        filter.status = {
          $in: [
            VehicleTaskStatus.PLANNED,
            VehicleTaskStatus.DUE_SOON,
            VehicleTaskStatus.OVERDUE,
          ],
        };
      } else {
        filter.status = status;
      }
    }

    if (severity) {
      filter.severity = severity;
    }

    if (vehicleId) {
      if (!Types.ObjectId.isValid(vehicleId)) {
        return { items: [], total: 0, page, limit };
      }
      filter.vehicleId = new Types.ObjectId(vehicleId);
    }

    if (type) {
      filter.type = type;
    }

    if (dueAfter || dueBefore) {
      filter.dueAt = {};
      if (dueAfter) {
        filter.dueAt.$gte = dueAfter;
      }
      if (dueBefore) {
        filter.dueAt.$lte = dueBefore;
      }
    }

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      VehicleTaskEntity.find(filter)
        .sort({ dueAt: 1, dueMileage: 1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "vehicleId",
          select: "plateNumber label brand model",
        })
        .lean(),
      VehicleTaskEntity.countDocuments(filter),
    ]);

    const items = docs.map((doc: any) => {
      const veh = doc.vehicleId || {};
      const vehiclePlate: string | undefined = veh.plateNumber;
      const vehicleLabel: string | undefined =
        veh.label ||
        [veh.brand, veh.model].filter(Boolean).join(" ") ||
        undefined;

      return {
        ...doc,
        vehicleId: veh._id?.toString?.() ?? doc.vehicleId?.toString?.(),
        vehiclePlate,
        vehicleLabel,
      };
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getTaskById(id: string): Promise<VehicleTask | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return VehicleTaskEntity.findOne({ _id: id });
  }

  async updateTask(
    id: string,
    payload: UpdateVehicleTaskDTO
  ): Promise<VehicleTask | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const update: Record<string, any> = {};

    if (payload.label !== undefined) {
      update.label = payload.label?.trim();
    }
    if (payload.description !== undefined) {
      update.description = payload.description?.trim();
    }
    if (payload.dueAt !== undefined) {
      update.dueAt = payload.dueAt;
    }
    if (payload.dueMileage !== undefined) {
      update.dueMileage = payload.dueMileage;
    }
    if (payload.severity !== undefined) {
      update.severity = payload.severity;
    }
    if (payload.status !== undefined) {
      update.status = payload.status;
    }

    if (Object.keys(update).length === 0) {
      return this.getTaskById(id);
    }

    return VehicleTaskEntity.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );
  }

  async completeTask(
    id: string,
    payload: CompleteVehicleTaskDTO
  ): Promise<VehicleTask | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    // 1) Récupérer la tâche actuelle
    const existing = await VehicleTaskEntity.findOne({ _id: id });
    if (!existing) return null;

    const completedAt = payload.completedAt ?? new Date();

    const update: Record<string, any> = {
      status: VehicleTaskStatus.COMPLETED,
      completedAt,
    };

    if (payload.completedMileage !== undefined) {
      update.completedMileage = payload.completedMileage;
    }
    if (payload.completionComment !== undefined) {
      update.completionComment = payload.completionComment?.trim();
    }

    // 2) Marquer la tâche comme complétée
    const completedTask = await VehicleTaskEntity.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    if (!completedTask) return null;

    // 3) Auto-générer la prochaine occurrence SI:
    //    - la tâche est liée à un template
    //    - le template a une récurrence (everyKm / everyMonths)
    if (!existing.templateId) {
      // We still update the km of the vehicle
      if (payload.completedMileage !== undefined) {
        await Vehicle.findByIdAndUpdate(existing.vehicleId, {
          $set: {
            currentMileage: payload.completedMileage,
            mileageUpdatedAt: completedAt,
          },
        });
      }
      return completedTask;
    }

    const template = await VehicleTaskTemplateEntity.findOne({
      _id: existing.templateId,
      active: true,
    });

    if (!template) {
      return completedTask;
    }

    // Pas de récurrence définie → on ne crée pas de nouvelle tâche
    if (!template.everyKm && !template.everyMonths) {
      // --- Mise à jour du véhicule si nécessaire ---
      const vehicle = await Vehicle.findById(existing.vehicleId)
        .select("currentMileage")
        .lean();

      const vehicleUpdate = this.buildVehicleUpdateFromTask({
        template,
        existing,
        payload,
        completedAt,
        nextDueAt: null,
        nextDueMileage: null,
        vehicleCurrentMileage: vehicle?.currentMileage ?? null,
      });

      if (Object.keys(vehicleUpdate).length > 0) {
        await Vehicle.findByIdAndUpdate(existing.vehicleId, {
          $set: vehicleUpdate,
        });
      }

      // ✅ Si tâche liée à un document mais pas de récurrence => on ne peut pas repousser expiresAt
      // (Optionnel: log)
      if (existing.vehicleDocumentId) {
        console.warn(
          "[vehicle-task.complete] Task linked to a document but template has no recurrence (no nextDueAt).",
          {
            taskId: existing._id.toString(),
            templateId: existing.templateId?.toString(),
          }
        );
      }

      return completedTask;
    }

    // 4) Récupérer le véhicule pour avoir le km actuel (si utile)
    const vehicle = await Vehicle.findById(existing.vehicleId)
      .select("currentMileage")
      .lean();

    const next = computeNextFromTemplate({
      triggerType: template.triggerType,
      everyKm: template.everyKm,
      everyMonths: template.everyMonths,
      completedAt,
      completedMileage:
        payload.completedMileage ?? existing.completedMileage ?? null,
      vehicleCurrentMileage: vehicle?.currentMileage ?? null,
      previousDueAt: existing.dueAt ?? null,
      previousDueMileage: existing.dueMileage ?? null,
    });

    let nextDueAt: Date | null = null;
    let nextDueMileage: number | null = null;

    if (next) {
      nextDueAt = next.nextDueAt ?? null;
      nextDueMileage = next.nextDueMileage ?? null;
    }

    // 5) Appliquer les effets sur le véhicule (km + champs métier)
    const vehicleUpdate = this.buildVehicleUpdateFromTask({
      template,
      existing,
      payload,
      completedAt,
      nextDueAt,
      nextDueMileage,
      vehicleCurrentMileage: vehicle?.currentMileage ?? null,
    });

    if (Object.keys(vehicleUpdate).length > 0) {
      await Vehicle.findByIdAndUpdate(existing.vehicleId, {
        $set: vehicleUpdate,
      });
    }

    // ✅ 8) MAJ DU DOCUMENT si la tâche est liée à un VehicleDocument
    // Si la tâche est un renouvellement basé date, nextDueAt doit exister
    if (existing.vehicleDocumentId) {
      if (!nextDueAt) {
        console.warn(
          "[vehicle-task.complete] Task linked to a document but nextDueAt is null (cannot update expiresAt).",
          {
            taskId: existing._id.toString(),
            templateId: existing.templateId?.toString(),
            triggerType: template.triggerType,
          }
        );
      } else {
        await VehicleDocumentEntity.findByIdAndUpdate(
          existing.vehicleDocumentId,
          {
            $set: {
              // ✅ clé du fix : le document n’est plus “expired”
              expiresAt: nextDueAt,

              // optionnel : mettre issuedAt = date de complétion (= date de renouvellement)
              issuedAt: completedAt,

              // reset anti-spam doc (si tu as un cron doc aussi)
              lastNotificationAt: null,
              notificationsCount: 0,
            },
          }
        );
      }
    }

    // 6) Créer la nouvelle tâche (cycle suivant) si next existe
    if (!next) {
      return completedTask;
    }

    // 5) Créer la nouvelle tâche (cycle suivant)
    // const nextTask =
    await VehicleTaskEntity.create({
      vehicleId: existing.vehicleId,

      vehicleDocumentId: existing.vehicleDocumentId ?? undefined,

      templateId: existing.templateId,
      type: template.type,
      triggerType: template.triggerType,
      label: existing.label || template.label,
      description: existing.description || template.description,
      dueAt: nextDueAt,
      dueMileage: nextDueMileage,
      severity: template.defaultSeverity,
      status: VehicleTaskStatus.PLANNED,

      notificationsCount: 0,
      lastNotificationAt: null,
      lastNotifiedState: null,
    });

    // console.log("[vehicle-task.complete] Next occurrence created", {
    //   prevTaskId: existing._id.toString(),
    //   nextTaskId: nextTask?._id.toString(),
    //   vehicleId: existing.vehicleId?.toString(),
    //   templateId: existing.templateId?.toString(),
    //   nextDueAt,
    //   nextDueMileage,
    // });

    // On retourne la tâche complétée (la nouvelle est juste un side-effect)
    return completedTask;
  }

  async completeMileage(
    id: string,
    payload: CompleteVehicleTaskDTO
  ): Promise<VehicleTask | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    // 1) Récupérer la tâche actuelle
    const existing = await VehicleTaskEntity.findOne({ _id: id });
    if (!existing) return null;

    const completedAt = payload.completedAt ?? new Date();

    const update: Record<string, any> = {
      status: VehicleTaskStatus.COMPLETED,
      completedAt,
    };

    if (payload.completedMileage !== undefined) {
      update.completedMileage = payload.completedMileage;
    }
    if (payload.completionComment !== undefined) {
      update.completionComment = payload.completionComment?.trim();
    }

    // 2) Marquer la tâche comme complétée
    const completedTask = await VehicleTaskEntity.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    if (!completedTask) return null;

    // 3) Auto-générer la prochaine occurrence SI:
    //    - la tâche est liée à un template
    //    - le template a une récurrence (everyKm / everyMonths)
    if (!existing.templateId) {
      // We still update the km of the vehicle
      if (payload.completedMileage !== undefined) {
        await Vehicle.findByIdAndUpdate(existing.vehicleId, {
          $set: {
            currentMileage: payload.completedMileage,
            mileageUpdatedAt: completedAt,
          },
        });
      }
      return completedTask;
    }

    const template = await VehicleTaskTemplateEntity.findOne({
      _id: existing.templateId,
      active: true,
    });

    if (!template) {
      return completedTask;
    }

    // Pas de récurrence définie → on ne crée pas de nouvelle tâche
    if (!template.everyKm && !template.everyMonths) {
      // --- Mise à jour du véhicule si nécessaire ---
      const vehicle = await Vehicle.findById(existing.vehicleId)
        .select("currentMileage")
        .lean();

      const vehicleUpdate = this.buildVehicleUpdateFromTask({
        template,
        existing,
        payload,
        completedAt,
        nextDueAt: null,
        nextDueMileage: null,
        vehicleCurrentMileage: vehicle?.currentMileage ?? null,
      });

      if (Object.keys(vehicleUpdate).length > 0) {
        await Vehicle.findByIdAndUpdate(existing.vehicleId, {
          $set: vehicleUpdate,
        });
      }

      // ✅ Si tâche liée à un document mais pas de récurrence => on ne peut pas repousser expiresAt
      // (Optionnel: log)
      if (existing.vehicleDocumentId) {
        console.warn(
          "[vehicle-task.complete] Task linked to a document but template has no recurrence (no nextDueAt).",
          {
            taskId: existing._id.toString(),
            templateId: existing.templateId?.toString(),
          }
        );
      }

      return completedTask;
    }

    // 4) Récupérer le véhicule pour avoir le km actuel (si utile)
    const vehicle = await Vehicle.findById(existing.vehicleId)
      .select("currentMileage")
      .lean();

    const next = computeNextFromTemplate({
      triggerType: template.triggerType,
      everyKm: template.everyKm,
      everyMonths: template.everyMonths,
      completedAt,
      completedMileage:
        payload.completedMileage ?? existing.completedMileage ?? null,
      vehicleCurrentMileage: vehicle?.currentMileage ?? null,
      previousDueAt: existing.dueAt ?? null,
      previousDueMileage: existing.dueMileage ?? null,
    });

    let nextDueAt: Date | null = null;
    let nextDueMileage: number | null = null;

    if (next) {
      nextDueAt = next.nextDueAt ?? null;
      nextDueMileage = next.nextDueMileage ?? null;
    }

    // 5) Appliquer les effets sur le véhicule (km + champs métier)
    const vehicleUpdate = this.buildVehicleUpdateFromTask({
      template,
      existing,
      payload,
      completedAt,
      nextDueAt,
      nextDueMileage,
      vehicleCurrentMileage: vehicle?.currentMileage ?? null,
    });

    if (Object.keys(vehicleUpdate).length > 0) {
      await Vehicle.findByIdAndUpdate(existing.vehicleId, {
        $set: vehicleUpdate,
      });
    }

    // ✅ 8) MAJ DU DOCUMENT si la tâche est liée à un VehicleDocument
    // Si la tâche est un renouvellement basé date, nextDueAt doit exister
    if (existing.vehicleDocumentId) {
      if (!nextDueAt) {
        console.warn(
          "[vehicle-task.complete] Task linked to a document but nextDueAt is null (cannot update expiresAt).",
          {
            taskId: existing._id.toString(),
            templateId: existing.templateId?.toString(),
            triggerType: template.triggerType,
          }
        );
      } else {
        await VehicleDocumentEntity.findByIdAndUpdate(
          existing.vehicleDocumentId,
          {
            $set: {
              // ✅ clé du fix : le document n’est plus “expired”
              expiresAt: nextDueAt,

              // optionnel : mettre issuedAt = date de complétion (= date de renouvellement)
              issuedAt: completedAt,

              // reset anti-spam doc (si tu as un cron doc aussi)
              lastNotificationAt: null,
              notificationsCount: 0,
            },
          }
        );
      }
    }

    // 6) Créer la nouvelle tâche (cycle suivant) si next existe
    if (!next) {
      return completedTask;
    }

    // 5) Créer la nouvelle tâche (cycle suivant)
    // const nextTask =
    await VehicleTaskEntity.create({
      vehicleId: existing.vehicleId,

      vehicleDocumentId: existing.vehicleDocumentId ?? undefined,

      templateId: existing.templateId,
      type: template.type,
      triggerType: template.triggerType,
      label: existing.label || template.label,
      description: existing.description || template.description,
      dueAt: nextDueAt,
      dueMileage: nextDueMileage,
      severity: template.defaultSeverity,
      status: VehicleTaskStatus.PLANNED,

      notificationsCount: 0,
      lastNotificationAt: null,
      lastNotifiedState: null,
    });

    // console.log("[vehicle-task.complete] Next occurrence created", {
    //   prevTaskId: existing._id.toString(),
    //   nextTaskId: nextTask?._id.toString(),
    //   vehicleId: existing.vehicleId?.toString(),
    //   templateId: existing.templateId?.toString(),
    //   nextDueAt,
    //   nextDueMileage,
    // });

    // On retourne la tâche complétée (la nouvelle est juste un side-effect)
    return completedTask;
  }
}
