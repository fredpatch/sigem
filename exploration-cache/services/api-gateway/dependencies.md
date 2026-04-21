# API Gateway Dependencies

## Internal Service Targets

- `inventory-service`: inventory domain endpoints
- `vehicle-service`: vehicles, documents, task templates, tasks
- `provider-service`: providers, products, purchases, purchase requests, supplies, stocks
- `reference-service`: references
- `notification-service`: notifications

## Runtime Patterns

- Each proxy reads its target URL from environment variables.
- The gateway depends on downstream services accepting versioned paths unchanged.
- Authentication happens in the gateway before requests are forwarded.
