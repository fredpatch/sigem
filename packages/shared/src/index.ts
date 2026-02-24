// DTO
// export * from "./dto/log-action.dto";
export * from "./dto/notification-event.dto";
// export * from "./dto/asset-event.dto";
export * from "./dto/response";
export * from "./dto/event";

// Constants
export * from "./constants/topics";
export * from "./constants/roles";
export * from "./constants";

// Types
export * from "./types/common";
export * from "./types/kafka";

// Utils
export * from "./utils/logger";
export * from "./http";

// Formatters
export * from "./utils/formatters";
export * from "./utils/scope";

// Templates
export * from "./templates";

// Middleware
export { default as middlewaresInit } from "./middleware";
export type { MiddlewareInitOptions } from "./middleware";

// Schema
export * from "./schema/asset.schema";

// Events & Kafka
export type { IEventBus } from "./events/event.bus";
export { setEventBus, getEventBus } from "./events/event.bus";
export {
  KafkaEventBus,
  type KafkaEventBusConfig,
} from "./events/providers/kafka-event.bus";
export { NoOpEventBus } from "./events/providers/no-op-event.bus";
export { unwrapKafkaEvent, type KafkaEnvelope } from "./events/common/unwrap";
export { startConsumer, type ConsumerConfig } from "./events/common/consumer";
export { emitEvent } from "./events/emit";
export {
  emitAuditEvent,
  emitNotificationEvent,
  emitSupplyEvent,
  emitVehicleEvent,
} from "./events/emitters";
export {
  ensureKafkaTopics,
  type EnsureTopicsConfig,
} from "./kafka/admin/ensure-topics";
export type {
  AuditEventPayload,
  NotificationEventPayload,
  SupplyEventPayload,
  VehicleEventPayload,
  EventEnvelope,
} from "./kafka/types";

// Auth
export * as Auth from "./auth";
export * from "./auth/types";
