import { VehicleTaskType } from "src/types/vehicle-task-template.type";

export function generateTemplateCode(
  type: VehicleTaskType,
  label: string
): string {
  const typePrefixMap: Record<VehicleTaskType, string> = {
    OIL_CHANGE: "OIL",
    MAINTENANCE: "MAINT",
    DOCUMENT_RENEWAL: "DOC",
    OTHER: "TASK",
  };

  const prefix = typePrefixMap[type] ?? "TASK";

  const normalizedLabel = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^A-Za-z0-9]+/g, "_") // anything non alphanum -> underscore
    .replace(/^_+|_+$/g, "") // trim _
    .toUpperCase();

  const baseCode = `${prefix}_${normalizedLabel}`.substring(0, 40);

  return baseCode;
}
