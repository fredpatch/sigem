// src/events/index.ts
export type { IEventBus } from "./event.bus";
export { setEventBus, getEventBus } from "./event.bus";
export {
  KafkaEventBus,
  type KafkaEventBusConfig,
} from "./providers/kafka-event.bus";
export { NoOpEventBus } from "./providers/no-op-event.bus";
export { unwrapKafkaEvent, type KafkaEnvelope } from "./common/unwrap";
export { startConsumer, type ConsumerConfig } from "./common/consumer";
export { emitEvent } from "./emit";
export {
  emitAuditEvent,
  emitNotificationEvent,
  emitSupplyEvent,
  emitVehicleEvent,
} from "./emitters";
