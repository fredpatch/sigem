// packages/shared/src/kafka/index.ts
/**
 * Kafka integration for SIGEM
 * Exports event bus, consumers, admin utilities, and types
 */

// Event Bus
export type { IEventBus } from "./event-bus";
export { setEventBus, getEventBus } from "./event-bus";

// Providers
export { KafkaEventBus, type KafkaEventBusConfig } from "./providers/kafka";
export { NoOpEventBus } from "./providers/noop";

// Consumer
export { startConsumer, type ConsumerConfig } from "./consumer/factory";
export { unwrapKafkaEvent, type KafkaEnvelope } from "./consumer/unwrap";

// Admin
export {
  ensureKafkaTopics,
  type EnsureTopicsConfig,
} from "./admin/ensure-topics";

// Types & Constants
export type {
  AuditEventPayload,
  NotificationEventPayload,
  SupplyEventPayload,
  VehicleEventPayload,
  EventEnvelope,
} from "./types";
export { KAFKA_TOPICS, TOPICS } from "../constants/topics";
export type { KafkaMessage } from "../types/kafka";
