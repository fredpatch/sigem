import { emitEvent } from "../emit";
import type { AuditEventPayload } from "../../kafka/types";

type EmitOptions = {
  log?: boolean;
  includeType?: boolean;
};

export async function emitAuditEvent(
  type: string,
  payload: AuditEventPayload,
  options?: EmitOptions,
) {
  return emitEvent({
    type,
    payload,
    log: options?.log,
    includeType: options?.includeType,
  });
}
