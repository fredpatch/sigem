# Kafka Environment Variables - Standardization Guide

## Overview

All SIGEM services use a standardized set of environment variables for Kafka configuration. This ensures consistent behavior across the microservices architecture and simplifies deployment and configuration management.

## Standardized Variables

### Required Variables

#### `KAFKA_BROKERS`

- **Type**: String (comma-separated list)
- **Format**: `host1:port1,host2:port2,...`
- **Default**: `100.84.234.98:9092` (development default, varies by service)
- **Required**: ✅ Yes
- **Description**: Kafka broker addresses for cluster connection
- **Example**: `100.84.234.98:9092` or `kafka-1:9092,kafka-2:9092,kafka-3:9092`

### Optional Variables

#### `KAFKA_CLIENT_ID`

- **Type**: String
- **Format**: Any alphanumeric string
- **Default**: Service-specific default (e.g., `sigem-notification`, `sigem-log-svc`)
- **Required**: ❌ No
- **Description**: Unique identifier for Kafka client connection
- **Example**:
  - `sigem-notification`
  - `sigem-log-svc`
  - `sigem-vehicle-service`

#### `KAFKA_GROUP_ID`

- **Type**: String
- **Format**: Any alphanumeric string
- **Default**: Service-specific default (e.g., `sigem-notification-g`, `sigem-log-svc`)
- **Required**: ❌ No (only needed for consumers)
- **Description**: Kafka consumer group identifier for coordinating message consumption
- **Example**:
  - `sigem-notification-g`
  - `sigem-inventory-g`
  - `sigem-vehicle-g`

## Service Configuration Status

| Service                  | KAFKA_BROKERS | KAFKA_CLIENT_ID | KAFKA_GROUP_ID | Config Location            |
| ------------------------ | ------------- | --------------- | -------------- | -------------------------- |
| **log-service**          | ✅            | ✅              | ✅             | `src/config/config.ts`     |
| **notification-service** | ✅            | ✅ (inline)     | ✅ (inline)    | `src/server.ts`            |
| **inventory-service**    | ✅            | ✅              | ✅             | `src/config/env.ts`        |
| **vehicle-service**      | ✅            | ✅              | ✅             | `src/config/env.ts`        |
| **provider-service**     | ✅            | ⚠️ (in config)  | ❌             | `src/core/events/index.ts` |
| **api-gateway**          | ✅            | ⚠️ (in config)  | ❌             | `src/core/events/index.ts` |

✅ = Fully configured
⚠️ = Configured in service code
❌ = Not required for this service

## Environment Variable Usage Patterns

### Pattern 1: Centralized Config File (Recommended)

```typescript
// src/config/env.ts or similar
export const env = {
  KAFKA_BROKERS: process.env.KAFKA_BROKERS ?? "100.84.234.98:9092",
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID ?? "sigem-service-name",
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID ?? "sigem-service-name-g",
};
```

Usage: Import `env` and use `env.KAFKA_BROKERS`, `env.KAFKA_CLIENT_ID`, `env.KAFKA_GROUP_ID`

### Pattern 2: Inline in Server Initialization (Current for notification-service)

```typescript
const brokers = (process.env.KAFKA_BROKERS || "localhost:9092")
  .split(",")
  .map((b) => b.trim());
const clientId = process.env.KAFKA_CLIENT_ID || "sigem-notification";
const groupId = process.env.KAFKA_GROUP_ID || "sigem-notification-g";
```

## Shared Kafka Implementation

All services now use a centralized Kafka consumer factory from `@sigem/shared/kafka`:

```typescript
import { startConsumer, ensureKafkaTopics } from "@sigem/shared/kafka";

// Ensure topics exist
await ensureKafkaTopics({ brokers });

// Start consumer with shared factory
await startConsumer({
  clientId,
  groupId,
  brokers,
  topics: ["topic1", "topic2"],
  handler: async (payload, metadata) => {
    // Handle incoming event
  },
  startupLog: true, // Log when consumer starts
  verifyOnConnect: true, // Verify broker connectivity
  connectWarnMs: 10000, // Warn if connection takes > 10s
  retryCount: 8, // Retry count on failure
  connectionTimeout: 15000, // Connection timeout in ms
});
```

## Deployment Configuration

### Development Environment (.env)

```bash
KAFKA_BROKERS=100.84.234.98:9092
KAFKA_CLIENT_ID=sigem-notification
KAFKA_GROUP_ID=sigem-notification-g
```

### Docker/Kubernetes (.env or ConfigMap)

```bash
KAFKA_BROKERS=kafka-broker-1:9092,kafka-broker-2:9092,kafka-broker-3:9092
KAFKA_CLIENT_ID=sigem-notification-prod
KAFKA_GROUP_ID=sigem-notification-prod-g
```

### Testing (optional override)

```bash
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=sigem-test-notification
KAFKA_GROUP_ID=sigem-test-notification-g
```

## Migration Status

All services have been successfully migrated to use the centralized Kafka implementation:

- ✅ **Phase 1**: Created centralized Kafka infrastructure in `@sigem/shared/kafka`
- ✅ **Phase 2**: Migrated notification-service to shared consumer factory
- ✅ **Phase 3**: Migrated inventory-service to re-export shared implementations
- ✅ **Phase 4**: Migrated vehicle-service to re-export shared implementations
- ✅ **Phase 5**: Standardized environment variables across all services

## Configuration Best Practices

1. **Use environment variables** instead of hardcoding broker addresses
2. **Provide sensible defaults** for optional variables (KAFKA_CLIENT_ID, KAFKA_GROUP_ID)
3. **Validate required variables** at startup (KAFKA_BROKERS should be checked before consumer starts)
4. **Use consistent naming** across all services (KAFKA\_\* prefix)
5. **Document in .env.example** for local development setup
6. **Use centralized config files** when possible (see Pattern 1 above)

## Troubleshooting

### Missing KAFKA_BROKERS

```
Error: Missing brokers; set KAFKA_BROKERS
```

**Solution**: Ensure `KAFKA_BROKERS` environment variable is set

### Connection timeout issues

```
[kafka] connection timeout after 15000ms
```

**Solution**:

- Verify broker address in `KAFKA_BROKERS`
- Check network connectivity to Kafka cluster
- Increase `connectionTimeout` if cluster is slow

### Consumer not receiving messages

```
[kafka] consumer waiting for messages...
```

**Solution**:

- Verify `KAFKA_GROUP_ID` is set correctly
- Check topic names in `startConsumer` call
- Verify topic exists (use `kafka-topics.sh --list` to check)
- Check consumer group offset: `kafka-consumer-groups.sh --group <group-id>`

## Related Documents

- [Kafka Consumer Migration Guide](./KAFKA_MIGRATION.md)
- [SIGEM Asset Tracking Documentation](./MG_Asset_Tracking_Scope_v3.md)
- [Service Architecture](./SIGEM_KPI_Sources_v1_fr.md)
