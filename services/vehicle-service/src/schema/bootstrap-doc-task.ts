import { Types } from "mongoose";
import { VehicleTaskTemplateEntity } from "src/models/vehicle-task-template.model";
import { VehicleTaskEntity } from "src/models/vehicle-task.model";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";
import {
  VehicleTaskType,
  TaskTriggerType,
} from "src/types/vehicle-task-template.type";
import { VehicleDocumentType } from "src/types/vehicle-document.type";

export async function createRenewalTaskForDocument(params: {
  dept: string;
  vehicleId: string;
  vehicleDocumentId: string;
  documentType: VehicleDocumentType;
  dueAt: Date;
}) {
  const { dept, vehicleId, vehicleDocumentId, documentType, dueAt } = params;

  const template = await VehicleTaskTemplateEntity.findOne({
    dept,
    active: true,
    type: VehicleTaskType.DOCUMENT_RENEWAL,
    triggerType: TaskTriggerType.BY_DATE,
    requiresDocument: true,
    documentType,
  }).lean();

  // Si pas de template (ex: docType non seed), on crée une tâche "simple"
  if (!template) {
    return VehicleTaskEntity.create({
      dept,
      vehicleId: new Types.ObjectId(vehicleId),
      vehicleDocumentId: new Types.ObjectId(vehicleDocumentId),

      templateId: undefined,
      type: VehicleTaskType.DOCUMENT_RENEWAL,
      triggerType: TaskTriggerType.BY_DATE,

      label: `Renouvellement document (${documentType})`,
      description: "",
      dueAt,
      status: VehicleTaskStatus.PLANNED,
      severity: "warning",
      notificationsCount: 0,
    });
  }

  return VehicleTaskEntity.create({
    dept,
    vehicleId: new Types.ObjectId(vehicleId),
    vehicleDocumentId: new Types.ObjectId(vehicleDocumentId),

    templateId: template._id,
    type: template.type,
    triggerType: template.triggerType,

    label: template.label,
    description: template.description ?? "",
    dueAt,

    status: VehicleTaskStatus.PLANNED,
    severity: template.defaultSeverity ?? "warning",
    notificationsCount: 0,
    lastNotificationAt: null,
    lastNotifiedState: null,
  });
}
