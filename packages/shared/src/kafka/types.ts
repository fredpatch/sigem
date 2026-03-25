// packages/shared/src/kafka/types.ts
/**
 * Enhanced Kafka event types for domain-specific events
 */

// Audit/Log event
export interface AuditEventPayload {
  version?: string;
  eventId?: string;
  type?: string;
  userId?: string;
  username?: string;
  role?: string;
  dept?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  result?: "success" | "failure";
  severity?: "info" | "warning" | "error";
  timestamp?: number | Date;
  data?: Record<string, any>;

  http?: {
    method?: string;
    path?: string;
    status?: number;
    ip?: string;
    userAgent?: string;
  };
}

// Notification event - flexible to support asset, supply, vehicle events
export interface NotificationEventPayload extends Record<string, any> {
  // Base notification fields
  title?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";
  userId?: string;
  recipients?: string[];
  resourceType?: string;
  resourceId?: string;

  // Asset event fields
  label?: string;
  assetId?: string;
  fromLocationLabel?: string;
  toLocationLabel?: string;
  fromStatus?: string;
  toStatus?: string;
  fromQuantity?: number;
  toQuantity?: number;

  // Supply event fields
  planLabel?: string;
  planName?: string;
  planId?: string;
  itemLabel?: string;
  name?: string;

  // Common fields
  data?: Record<string, any>;
}

// Supply/Asset event
export interface SupplyEventPayload {
  title?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";
  userId?: string;
  role?: string;
  recipients?: string[];
  dept?: string;
  actor?: {
    userId?: string;
    role?: string;
    dept?: string;
    name?: string;
    matriculation?: string;
  };
  resourceType?: "SupplyPlan" | "SupplyItem" | "SupplyPrice" | "Asset";
  resourceId?: string;
  data?: Record<string, any>;
}

// Vehicle event
export interface VehicleEventPayload {
  title?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";
  resourceType?: "Vehicle" | "Task" | "Document" | "Template";
  resourceId?: string;
  data?: Record<string, any>;
}

// Generic event envelope from event bus
export interface EventEnvelope<T = any> {
  type?: string;
  payload: T;
  ts?: number;
  eventId?: string;
}
