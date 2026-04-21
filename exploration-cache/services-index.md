# Services Index

## Current Status

| Service | Status | Summary |
| --- | --- | --- |
| api-gateway | partial | Entry point, route grouping, and proxy mapping explored |
| inventory-service | partial | Asset domain sampled; no explicit ticket entity found yet |
| log-service | not_started | Pending |
| notification-service | not_started | Pending |
| provider-service | partial | Purchase request lifecycle explored; closest match to ticketing |
| reference-service | not_started | Pending |
| vehicle-service | not_started | Pending |

## Quick Lookup

- `api-gateway`: versioned routing, auth before proxy, routes to inventory/provider/vehicle services
- `provider-service`: `purchase-requests`, `purchases`, `supplies`, `stocks`
- `inventory-service`: assets, categories, locations, reference values
- `vehicle-service`: likely relevant follow-up for task-based workflows
