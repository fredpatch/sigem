import { emitEvent } from "../emit";
import type { SupplyEventPayload } from "../../kafka/types";

type EmitOptions = {
  log?: boolean;
  includeType?: boolean;
};

export async function emitSupplyEvent(
  type: string,
  payload: SupplyEventPayload,
  options?: EmitOptions,
) {
  return emitEvent({
    type,
    payload,
    log: options?.log,
    includeType: options?.includeType,
  });
}
