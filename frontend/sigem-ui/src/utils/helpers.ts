import {
  NotificationSeverity,
  SocketNotification,
} from "@/modules/notifications/hooks/use-real-time-notification";
import { useNotificationStore } from "@/modules/notifications/store/notification-store";
import { VehicleTask } from "@/modules/vehicules/types/types";

import { AxiosError } from "axios";

export function generateSecurePassword(length = 12) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}
// role: z.enum(["SUPER_ADMIN", "ADMIN", "MG_AGT", "MG_COS", "MG_COB"]),
export const getAssignableRoles = (currentUserRole: string) => {
  switch (currentUserRole) {
    case "SUPER_ADMIN":
      return ["SUPER_ADMIN", "ADMIN", "MG_AGT", "MG_COS", "MG_COB"];
    case "admin":
      return ["ADMIN", "MG_AGT", "MG_COS", "MG_COB"];
    case "MG_AGT":
      return ["MG_AGT"];
    case "MG_COS":
      return ["MG_COS"];
    case "MG_COB":
      return ["MG_COB"];
    default:
      return [];
  }
};

// utils/presence-status.ts
export const getStatusStyle = (status: string) => {
  switch (status) {
    case "present":
      return "bg-green-100 text-green-800";
    case "holiday":
      return "bg-yellow-100 text-yellow-800";
    case "sick_leave":
      return "bg-blue-100 text-blue-800";
    case "permission":
      return "bg-indigo-100 text-indigo-800";
    case "absent_unexcused":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface NotificationParams {
  notification: SocketNotification | null;
  message?: string;
  msgDescription?: string;

  type?: NotificationSeverity;
}

export const useShowNotification = ({
  notification,
  message,
  msgDescription,
  type,
}: NotificationParams) => {
  const { addNotification } = useNotificationStore();

  return addNotification(notification, message, msgDescription, type);
};

export const handleAxiosError = (error: AxiosError) => {
  let message = "An error occurred";

  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      message =
        "Unable to connect to the server. Please check your internet connection and try again.";
    } else {
      message = "The service is currently unavailable. Please try again later.";
    }
  } else {
    const status = error.response.status;

    if (status === 401)
      message = "You are not logged in. Please log in to continue.";
    else if (status === 403)
      message = "You do not have permission to perform this action.";
    else if (status === 404) message = "The requested resource was not found.";
    else if (status >= 500)
      message = "The server encountered an error. Please try again later.";
  }

  return Promise.reject({ ...error, message });
};

type UrgencyRow = {
  task: VehicleTask;
  vehicleKey: string; // stringified id
  status: string;
  severityScore: number;
  // Plus petit = plus urgent
  dueScore: number;
};

const SEVERITY_SCORE: Record<string, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

function toTime(v?: string | number | Date | null) {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(v);
  const t = d.getTime();
  return Number.isFinite(t) ? t : undefined;
}

function normalizeVehicleKey(task: VehicleTask): string {
  const raw: any = (task as any).vehicleId;
  if (!raw) return "UNKNOWN";
  // mongoose ObjectId, string, populated doc...
  if (typeof raw === "string") return raw;
  if (typeof raw?.toString === "function") return raw.toString();
  if (typeof raw?._id === "string") return raw._id;
  if (typeof raw?._id?.toString === "function") return raw._id.toString();
  return "UNKNOWN";
}

function severityScore(task: VehicleTask): number {
  const sev = String((task as any).severity ?? "info").toLowerCase();
  return SEVERITY_SCORE[sev] ?? 1;
}

/**
 * Calcule un "dueScore" : plus petit => plus urgent.
 * - Si on a une date d'échéance : plus proche (ou déjà passée) => plus urgent
 * - Sinon si on a un kmRestant : plus petit => plus urgent
 * - Sinon fallback
 */
function dueScore(task: VehicleTask): number {
  // essaie plusieurs champs possibles (selon ton modèle)
  const dueAt =
    toTime((task as any).dueAt) ??
    toTime((task as any).dueDate) ??
    toTime((task as any).nextDueDate);

  if (dueAt != null) return dueAt;

  const kmRemaining =
    (task as any).remainingKm ??
    (task as any).kmRemaining ??
    (task as any).kmLeft;

  if (typeof kmRemaining === "number" && Number.isFinite(kmRemaining)) {
    // plus petit => plus urgent
    return kmRemaining;
  }

  // fallback: met très loin
  return Number.POSITIVE_INFINITY;
}

function buildRow(task: VehicleTask): UrgencyRow {
  return {
    task,
    vehicleKey: normalizeVehicleKey(task),
    status: String((task as any).status ?? ""),
    severityScore: severityScore(task),
    dueScore: dueScore(task),
  };
}

/**
 * Top urgences OVERDUE :
 * - status === "OVERDUE"
 * - tri: severity desc, puis dueScore asc
 */
export function getTopOverdueTasks(
  tasks: VehicleTask[],
  limit = 5,
): VehicleTask[] {
  return tasks
    .filter((t) => String((t as any).status) === "OVERDUE")
    .map(buildRow)
    .sort((a, b) => {
      if (b.severityScore !== a.severityScore)
        return b.severityScore - a.severityScore;
      return a.dueScore - b.dueScore;
    })
    .slice(0, limit)
    .map((r) => r.task);
}

/**
 * Top urgences DUE_SOON :
 * - status === "DUE_SOON"
 * - tri: dueScore asc, puis severity desc
 */
export function getTopDueSoonTasks(
  tasks: VehicleTask[],
  limit = 5,
): VehicleTask[] {
  // console.log(tasks);
  return tasks
    .filter((t) => String((t as any).status) === "DUE_SOON")
    .map(buildRow)
    .sort((a, b) => {
      if (a.dueScore !== b.dueScore) return a.dueScore - b.dueScore;
      return b.severityScore - a.severityScore;
    })
    .slice(0, limit)
    .map((r) => r.task);
}

/**
 * Optionnel : éviter d'avoir 5 tâches du même véhicule
 * (utile si tu veux que le top représente plusieurs véhicules)
 */
export function uniqueByVehicle(
  tasks: VehicleTask[],
  limit = 5,
): VehicleTask[] {
  const seen = new Set<string>();
  const out: VehicleTask[] = [];
  for (const t of tasks) {
    const key = normalizeVehicleKey(t);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= limit) break;
  }
  return out;
}

function daysBetween(from: number, to: number) {
  const ms = to - from;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function formatDueLabel(task: any) {
  // essaie plusieurs champs selon ton modèle
  const dueAt =
    task.dueAt ?? task.dueDate ?? task.nextDueDate ?? task.expectedAt ?? null;

  const kmRemaining =
    task.remainingKm ?? task.kmRemaining ?? task.dueMileage ?? null;

  // date
  if (dueAt) {
    const now = Date.now();
    const t = new Date(dueAt).getTime();
    if (Number.isFinite(t)) {
      const d = daysBetween(now, t);
      if (d === 0) return "Aujourd’hui";
      if (d > 0) return `Dans ${d} jour${d > 1 ? "s" : ""}`;
      const late = Math.abs(d);
      return `En retard de ${late} jour${late > 1 ? "s" : ""}`;
    }
  }

  // km
  if (typeof kmRemaining === "number" && Number.isFinite(kmRemaining)) {
    if (kmRemaining === 0) return "À échéance (km)";
    if (kmRemaining > 0)
      return `Dans ${kmRemaining.toLocaleString("fr-FR")} km`;
    const late = Math.abs(kmRemaining);
    return `En retard de ${late.toLocaleString("fr-FR")} km`;
  }

  return "Échéance inconnue";
}

export function taskTypeLabel(task: any) {
  const type = String(
    task.type ?? task.taskType ?? task.templateType ?? "OTHER",
  );
  const map: Record<string, string> = {
    OIL_CHANGE: "Vidange",
    MAINTENANCE: "Maintenance",
    DOCUMENT_RENEWAL: "Renouvellement document",
    TECH_INSPECTION: "Visite technique",
    INSURANCE: "Assurance",
    PARKING_CARD: "Carte parking",
    EXTINGUISHER_CARD: "Extincteur",
    OTHER: "Autre",
  };
  return map[type] ?? type;
}

const isValidDate = (v?: any) => v && !Number.isNaN(new Date(v).getTime());

export const getExpiryBadge = (iso?: string | null) => {
  if (!iso || !isValidDate(iso))
    return { label: "N/A", variant: "outline" as const };

  const now = new Date();
  const d = new Date(iso);
  const diffDays = Math.ceil(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return { label: "Expiré", variant: "destructive" as const };
  if (diffDays <= 30)
    return { label: `Bientôt (${diffDays}j)`, variant: "secondary" as const };
  return { label: "Valide", variant: "valide" as const };
};

export const fmt = (v?: string | number | null) => {
  if (v == null || v === "") return "-";
  if (typeof v === "number") return v.toLocaleString("fr-FR");
  return String(v);
};

export const labelUsage = (v?: any) =>
  v === "FONCTION"
    ? "Fonction"
    : v === "SERVICE"
      ? "Service"
      : v
        ? v
        : "Non renseigné";

export const labelEnergy = (v?: any) =>
  v === "DIESEL"
    ? "Diesel"
    : v === "ESSENCE"
      ? "Essence"
      : v === "HYBRIDE"
        ? "Hybride"
        : v === "ELECTRIQUE"
          ? "Électrique"
          : v
            ? v
            : "Non renseigné";
