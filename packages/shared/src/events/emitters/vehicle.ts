import { emitEvent } from "../emit";
import type { VehicleEventPayload } from "../../kafka/types";

type EmitOptions = {
  log?: boolean;
  includeType?: boolean;
};

export async function emitVehicleEvent(
  type: string,
  payload: VehicleEventPayload,
  options?: EmitOptions,
) {
  return emitEvent({
    type,
    payload,
    log: options?.log,
    includeType: options?.includeType,
  });
}
