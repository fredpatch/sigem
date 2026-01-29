// core/events/supply.events.ts
import { getEventBus } from "./index";

// import { getEventBus } from "./event.bus";

type Actor = {
  userId?: string;
  role?: string;
  dept?: string;
  name?: string;
  matriculation?: string;
};

type SupplyEventPayload = {
  // meta générique notification-service
  title?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";

  // ciblage
  userId?: string;
  role?: string;
  recipients?: string[];

  // audit/correlation
  dept?: string;
  actor?: Actor;

  // ressource
  resourceType?: "SupplyPlan" | "SupplyItem" | "SupplyPrice";
  resourceId?: string;

  // données métier
  data?: any;
};

export async function emitSupplyEvent(
  type:
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
    | "supply.price.deleted",
  payload: SupplyEventPayload,
) {
  const bus = getEventBus();
  console.log("[supply-kafka-event]", { payload, topic: type });
  return bus.emit(type, { type, ...payload }); // ok même si notif-service lit (evt.type ?? topic)
}
