# Communication Patterns

## Observed So Far

- The gateway proxies HTTP requests to downstream services.
- Versioned URLs are preserved across the proxy boundary.
- User context is forwarded via headers after gateway authentication.
- Provider and inventory services use in-process middleware chains for auth, roles, validation, and audit.

## Follow-up

- Confirm whether asynchronous business events are actively used across services, or are mostly scaffolded for future Kafka usage.
