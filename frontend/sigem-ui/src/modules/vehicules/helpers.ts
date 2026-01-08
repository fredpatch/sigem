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
