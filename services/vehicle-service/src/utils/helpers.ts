import { TaskTriggerType } from "src/types/vehicle-task-template.type";
import { VehicleTaskStatus } from "src/types/vehicle-task.types";

const DEFAULT_NOTICE_DAYS = 14;
const DEFAULT_NOTICE_KM = 500;

// Helper pour calculer j-14
export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export /**
 * Calcule le nouveau statut de la tâche selon:
 * - dueAt / date du jour
 * - dueMileage / currentMileage
 */
function computeTaskStatus(options: {
  dueAt?: Date;
  dueMileage?: number;
  currentMileage?: number;
}): VehicleTaskStatus {
  const now = new Date();
  let status: VehicleTaskStatus = VehicleTaskStatus.PLANNED;

  const { dueAt, dueMileage, currentMileage } = options;

  // --- Règle date ---
  if (dueAt) {
    const dueSoonDate = addDays(dueAt, -DEFAULT_NOTICE_DAYS);
    if (now > dueAt) {
      status = VehicleTaskStatus.OVERDUE;
    } else if (now >= dueSoonDate) {
      status = VehicleTaskStatus.DUE_SOON;
    }
  }

  // --- Règle kilométrage ---
  if (dueMileage != null && currentMileage != null) {
    const dueSoonMileage = dueMileage - DEFAULT_NOTICE_KM;

    if (currentMileage >= dueMileage) {
      status = VehicleTaskStatus.OVERDUE;
    } else if (currentMileage >= dueSoonMileage) {
      // Ne downgrade pas un OVERDUE
      if (status !== VehicleTaskStatus.OVERDUE) {
        status = VehicleTaskStatus.DUE_SOON;
      }
    }
  }

  return status;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function computeNextFromTemplate(options: {
  triggerType: TaskTriggerType;
  everyKm?: number | null;
  everyMonths?: number | null;
  completedAt: Date;
  completedMileage?: number | null;
  vehicleCurrentMileage?: number | null;
  previousDueAt?: Date | null;
  previousDueMileage?: number | null;
}): { nextDueAt?: Date; nextDueMileage?: number } | null {
  const {
    triggerType,
    everyKm,
    everyMonths,
    completedAt,
    completedMileage,
    vehicleCurrentMileage,
    previousDueAt,
    previousDueMileage,
  } = options;

  let nextDueAt: Date | undefined;
  let nextDueMileage: number | undefined;

  // Base mileage: priorité au completedMileage, sinon dueMileage précédent, sinon currentMileage véhicule
  const baseMileage =
    completedMileage ?? previousDueMileage ?? vehicleCurrentMileage ?? null;

  switch (triggerType) {
    case TaskTriggerType.BY_MILEAGE: {
      if (!everyKm || !baseMileage) return null;
      nextDueMileage = baseMileage + everyKm;
      break;
    }

    case TaskTriggerType.BY_DATE: {
      if (!everyMonths) return null;
      nextDueAt = addMonths(completedAt, everyMonths);
      break;
    }

    case TaskTriggerType.BY_DATE_OR_MILEAGE: {
      if (everyMonths) {
        nextDueAt = addMonths(completedAt, everyMonths);
      }
      if (everyKm && baseMileage) {
        nextDueMileage = baseMileage + everyKm;
      }
      if (!nextDueAt && !nextDueMileage) return null;
      break;
    }

    default:
      return null;
  }

  return { nextDueAt, nextDueMileage };
}

const OIL_INTERVAL_KM_DEFAULT = 1000;
const DUE_SOON_THRESHOLD_KM = 100;

// Helpers pour éviter le mismatch de noms de champs
export function getDueKm(task: any): number | undefined {
  return (
    task?.dueMileageKm ??
    task?.dueKm ??
    task?.dueMileage ??
    task?.dueAtKm ??
    task?.echeanceKm ??
    task?.deadlineKm
  );
}

export function getIntervalKm(task: any): number {
  return (
    task?.intervalKm ??
    task?.cadenceKm ??
    task?.frequencyKm ??
    OIL_INTERVAL_KM_DEFAULT
  );
}

export function getDoneKm(task: any): number | undefined {
  return (
    task?.doneMileageKm ??
    task?.completedMileageKm ??
    task?.doneKm ??
    task?.completedKm
  );
}

export function normalizeStatus(remainingKm: number, noticeKmBefore = 100) {
  if (remainingKm <= 0) return VehicleTaskStatus.OVERDUE;
  if (remainingKm <= noticeKmBefore) return VehicleTaskStatus.DUE_SOON;
  return VehicleTaskStatus.PLANNED;
}
