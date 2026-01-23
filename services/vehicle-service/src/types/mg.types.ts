import { VehicleDocumentType } from "./vehicle-document.type";
import { TaskTriggerType, VehicleTaskType } from "./vehicle-task-template.type";
import { VehicleTaskStatus } from "./vehicle-task.types";

export const OPEN_STATUSES = [
  VehicleTaskStatus.OVERDUE,
  VehicleTaskStatus.DUE_SOON,
  VehicleTaskStatus.PLANNED,
] as const;

export function statusRank(s: string) {
  switch (s) {
    case VehicleTaskStatus.OVERDUE:
      return 1;
    case VehicleTaskStatus.DUE_SOON:
      return 2;
    case VehicleTaskStatus.PLANNED:
      return 3;
    default:
      return 9;
  }
}

export type DocTemplateDefault = {
  documentType: VehicleDocumentType;
  code: string; // unique (index code)
  label: string;
  description?: string;
  everyMonths: number; // default recurrence
  noticeDaysBefore?: number;
  defaultSeverity?: "info" | "warning" | "critical";
};

export const MG_DOC_TEMPLATE_DEFAULTS: DocTemplateDefault[] = [
  {
    documentType: VehicleDocumentType.INSURANCE,
    code: "DOC_INSURANCE_RENEWAL",
    label: "Renouvellement assurance",
    description: "Suivi de la validité de l’assurance",
    everyMonths: 12,
    noticeDaysBefore: 30,
    defaultSeverity: "critical",
  },
  {
    documentType: VehicleDocumentType.TECH_INSPECTION,
    code: "DOC_TECH_INSPECTION_RENEWAL",
    label: "Visite technique",
    description: "Suivi de la visite technique",
    everyMonths: 12,
    noticeDaysBefore: 30,
    defaultSeverity: "warning",
  },
  {
    documentType: VehicleDocumentType.PARKING_CARD,
    code: "DOC_PARKING_CARD_RENEWAL",
    label: "Renouvellement carte parking",
    description: "Suivi de la carte de stationnement",
    everyMonths: 12,
    noticeDaysBefore: 30,
    defaultSeverity: "warning",
  },
  {
    documentType: VehicleDocumentType.EXTINGUISHER_CARD,
    code: "DOC_EXTINGUISHER_CARD_RENEWAL",
    label: "Renouvellement carte extincteur",
    description: "Suivi de la carte extincteur",
    everyMonths: 12,
    noticeDaysBefore: 30,
    defaultSeverity: "warning",
  },
].map((d) => ({
  ...d,
  // ces champs sont constants pour tous les docs:
  // on les gardera dans le seed
})) as DocTemplateDefault[];

export const DOC_TEMPLATE_CONSTANTS = {
  type: VehicleTaskType.DOCUMENT_RENEWAL,
  triggerType: TaskTriggerType.BY_DATE,
  requiresDocument: true,
} as const;
