import { Severity } from "@sigem/shared";
import { Request, Response, NextFunction } from "express";

export function mapSeverityToNotificationType(
  s?: Severity,
): "success" | "error" | "info" | "warning" {
  switch (s) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "error":
    case "critical":
      return "error";
    default:
      return "info";
  }
}

export interface ActorInfo {
  id?: string;
  username?: string;
  sessionId?: string;
  role?: string;
  // dept?: string;
}

export function getActor(req: Request): ActorInfo {
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

export type Scope = "user" | "role" | "all";

function isMissing(field: string) {
  // "global" = pas de ciblage explicite
  return {
    $or: [{ [field]: { $exists: false } }, { [field]: null }, { [field]: "" }],
  };
}

export function buildScopeFilter(params: {
  userId?: string;
  role?: string;
  scope: Scope;
  includeGlobal: boolean;
}) {
  const { userId, role, scope, includeGlobal } = params;

  const base: any = { deleted: { $ne: true } };

  // ✅ Clause "global" robuste (match absent OU null OU empty)
  const globalClause = includeGlobal
    ? [
        {
          $and: [isMissing("userId"), isMissing("role")],
        },
      ]
    : [];

  // if (scope === "all") {
  //   const ors: any[] = [];
  //   if (userId) ors.push({ userId });
  //   if (role) ors.push({ role });
  //   return { ...base, $or: [...ors, ...globalClause] };
  // }

  // ✅ mode "all": tout (debug / phase 1)
  if (scope === "all") {
    if (!includeGlobal) {
      // exclure global
      return {
        ...base,
        $or: [
          { userId: { $exists: true, $nin: [null, ""] } },
          { role: { $exists: true, $nin: [null, ""] } },
        ],
      };
    }
    return base; // tout inclut global
  }

  if (scope === "role") {
    if (!role) return { ...base, _id: null }; // aucun résultat si pas de role
    return { ...base, $or: [{ role }, ...globalClause] };
  }

  // scope=user
  if (!userId) return { ...base, _id: null }; // aucun résultat si pas de userId
  return { ...base, $or: [{ userId }, ...globalClause] };
}

export const catchError =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function parseBool(v: any): boolean | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (["1", "true", "yes", "y"].includes(s)) return true;
  if (["0", "false", "no", "n"].includes(s)) return false;
  return undefined;
}

export function parseIntSafe(v: any, def: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
}

export function toDTO(doc: any) {
  const p = doc.payload ?? {};

  const relatedResource = p.taskId
    ? { resourceType: p.resourceType ?? "VehicleTask", resourceId: p.taskId }
    : p.documentId
      ? {
          resourceType: p.resourceType ?? "VehicleDocument",
          resourceId: p.documentId,
        }
      : p.vehicleId
        ? { resourceType: p.resourceType ?? "Vehicle", resourceId: p.vehicleId }
        : p.assetId || p.resourceId
          ? {
              resourceType: p.resourceType ?? "Asset",
              resourceId: p.assetId ?? p.resourceId,
            }
          : undefined;

  return {
    id: doc._id.toString(),
    title: doc.title ?? doc.type,
    message: doc.message ?? "",
    type: doc.type,
    severity: doc.severity ?? "info",
    createdAt: doc.createdAt,
    isRead: !!doc.read,
    isDeleted: !!doc.deleted,
    payload: doc.payload, // optionnel: tu peux enlever si tu veux alléger
    relatedResource,
  };
}

export const KNOWN_TOPICS = new Set([
  "asset.created",
  "ASSET_CREATED",
  "asset.updated",
  "ASSET_UPDATED",
  "asset.deleted",
  "ASSET_DELETED",
  "asset.restored",
  "ASSET_RESTORED",
  "asset.location.changed",
  "ASSET_LOCATION_CHANGED",
  "asset.status.changed",
  "ASSET_STATUS_CHANGED",
  "asset.quantity.changed",
  "ASSET_QUANTITY_CHANGED",
  "asset.transfer",
  "ASSET_TRANSFER",

  "stock.low",
  "STOCK_LOW",
  "stock.critical",
  "STOCK_CRITICAL",

  // ✅ Vehicle monitoring
  "vehicle.task.due_soon",
  "vehicle.task.overdue",
  "vehicle.task.completed",
  "vehicle.task.created",
  "vehicle.task.updated",
  "vehicle.task.deleted",
  "vehicle.task.next_planned",

  // vehicle documents
  "vehicle.document.created",
  "vehicle.document.updated",
  "vehicle.document.deleted",
  "vehicle.document.due_soon",
  "vehicle.document.renewed",
  "vehicle.document.expiring",

  // vehicles
  "vehicle.created",
  "vehicle.updated",
  "vehicle.deleted",
  "vehicle.mileage.updated",

  // templates (optionnel)
  "vehicle.task_template.created",
  "vehicle.task_template.updated",
  "vehicle.task_template.activated",
  "vehicle.task_template.deactivated",

  "auth.otp.requested",

  "supply.plan.created",
  "supply.plan.updated",
  "supply.plan.status.changed",
  "supply.plan.completed",
  "supply.plan.deleted",

  "supply.item.created",
  "supply.item.updated",
  "supply.item.deactivated",
  "supply.item.activated",

  "supply.price.updated",
  "supply.price.deleted",
]);

export const IMPORTANT = new Set(["warning", "error"]); // (success/info ignorés si inconnus)

export type VehicleNotifyPayload = {
  type: string; // ex: "vehicle.task.overdue"
  severity?: "info" | "warning" | "critical" | "error" | "success";

  // ciblage (tu utilises déjà userId/role/recipients)
  userId?: string;
  role?: string;
  recipients?: string[];

  // ressources liées
  resourceType?: "VehicleTask" | "VehicleDocument" | "Vehicle";
  resourceId?: string;

  vehicleId?: string;
  vehiclePlate?: string; // ex: "GA-123-AA"
  vehicleLabel?: string; // ex: "Toyota Hilux"

  taskId?: string;
  taskLabel?: string; // ex: "Vidange"
  dueAt?: string | Date;
  dueMileage?: number;

  documentId?: string;
  documentType?: string; // ex: "INSURANCE"
  expiresAt?: string | Date;
  remainingDays?: number;
};

export function fmtVehicle(anyEvt: any) {
  const plate =
    anyEvt.vehiclePlate ?? anyEvt.plateNumber ?? anyEvt.vehicleId ?? "-";
  const brand = anyEvt.vehicleBrand ?? "";
  const model = anyEvt.vehicleModel ?? "";
  const car = [brand, model].filter(Boolean).join(" ");
  return car ? `${plate} (${car})` : plate;
}

export function fmtDue(anyEvt: any) {
  // BY_DATE → afficher date
  if (anyEvt.dueAt) {
    const d = new Date(anyEvt.dueAt);
    if (!isNaN(d.getTime()))
      return `Échéance : ${d.toLocaleDateString("fr-FR")}`;
  }
  // BY_MILEAGE → afficher km
  if (typeof anyEvt.dueMileage === "number") {
    const cur =
      typeof anyEvt.currentMileage === "number" ? anyEvt.currentMileage : null;
    const left = cur !== null ? anyEvt.dueMileage - cur : null;
    if (left !== null)
      return `Échéance : ${anyEvt.dueMileage} km (reste ~${left} km)`;
    return `Échéance : ${anyEvt.dueMileage} km`;
  }
  return "";
}

export function fmtDocType(raw?: string) {
  if (!raw) return "Document";
  const map: Record<string, string> = {
    INSURANCE: "Assurance",
    PARKING_CARD: "Carte parking",
    EXTINGUISHER_CARD: "Carte extincteur",
    TECH_INSPECTION: "Visite technique",
    OTHER: "Document",
  };
  return map[raw] ?? raw;
}

export function fmtDate(d?: any) {
  if (!d) return "-";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(+dt)) return "-";
  return dt.toLocaleDateString("fr-FR");
}

export function fmtMileage(n?: any) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return "";
  return `${v.toLocaleString("fr-FR")} km`;
}
