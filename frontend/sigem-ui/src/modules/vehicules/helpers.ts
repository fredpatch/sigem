import { VehicleDocument } from "./types/vehicle-document.types";
import { Vehicle } from "./types/vehicle.types";

// helpers type guards
export function isVehicleDocument(obj: any): obj is VehicleDocument {
  return (
    obj && typeof obj === "object" && "vehicleId" in obj && "expiresAt" in obj
  );
}

export function isVehicle(obj: any): obj is Vehicle {
  return (
    obj &&
    typeof obj === "object" &&
    "plateNumber" in obj &&
    "currentMileage" in obj
  );
}

export function safe(v: any, fallback = "N/A") {
  if (v === null || v === undefined || v === "") return fallback;
  return v;
}

export function safeDate(d?: string | Date | null, fallback = "-") {
  if (!d) return fallback;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("fr-FR");
}

export function safeDaysUntil(d?: string | Date | null) {
  if (!d) return "-";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return "-";
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expiré";
  return `${days} jours`;
}

export function join(parts: any[], sep = " ") {
  return parts.filter(Boolean).join(sep) || "-";
}
