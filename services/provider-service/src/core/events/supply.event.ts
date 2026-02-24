// core/events/supply.events.ts
import { emitEvent, type SupplyEventPayload } from "@sigem/shared";

// import { getEventBus } from "./event.bus";

export type SupplyEventType =
  | "supply.plan.created"
  | "supply.plan.updated"
  | "supply.plan.status.changed"
  | "supply.plan.completed"
  | "supply.plan.deleted"
  | "supply.item.created"
  | "supply.item.updated"
  | "supply.item.deactivated"
  | "supply.item.activated"
  | "supply.price.updated"
  | "supply.price.deleted";

export async function emitSupplyEvent(
  type: SupplyEventType,
  payload: SupplyEventPayload,
  log = false,
) {
  return emitEvent({
    type,
    payload,
    log,
    includeType: true,
  });
}
