import { emitEvent } from "../emit";
import type { NotificationEventPayload } from "../../kafka/types";

type EmitOptions = {
  log?: boolean;
  includeType?: boolean;
};

export async function emitNotificationEvent(
  type: string,
  payload: NotificationEventPayload,
  options?: EmitOptions,
) {
  return emitEvent({
    type,
    payload,
    log: options?.log,
    includeType: options?.includeType,
  });
}
