# API Gateway - Explored 2026-04-21

## Path

`services/api-gateway/`

## Purpose

Public entry point for SIGEM APIs. It mounts local gateway routes such as auth and users, and proxies domain routes to downstream services after authentication.

## Key Files

- `src/app.ts` - boots Express, shared middlewares, and proxy routers
- `src/routes/index.ts` - mounts route groups under `/${API_VERSION}`
- `src/config/routes.path.ts` - defines local gateway-owned route groups
- `src/config/services.ts` - canonical route segment names for downstream services
- `src/routes/vehicles.proxy.router.ts` - proxies vehicle endpoints
- `src/routes/providers.proxy.router.ts` - proxies provider endpoints
- `src/routes/products.proxy.router.ts` - proxies products, purchases, and purchase requests
- `src/routes/supplier.proxy.router.ts` - proxies supplies endpoints
- `src/routes/stocks.proxy.router.ts` - proxies stock endpoints

## Main Endpoints

| Endpoint Prefix | Ownership | Purpose | Downstream |
| --- | --- | --- | --- |
| `/v1/health` | gateway | health | local |
| `/v1/_debug` | gateway | diagnostics | local |
| `/v1/auth` | gateway | auth workflow | local |
| `/v1/users` | gateway | user management | local |
| `/v1/directory` | gateway | employee directory | local |
| `/v1/inventory` | gateway | inventory proxy | inventory-service |
| `/v1/vehicles` | gateway | vehicle proxy | vehicle-service |
| `/v1/vehicle-documents` | gateway | vehicle documents proxy | vehicle-service |
| `/v1/vehicle-task-templates` | gateway | task template proxy | vehicle-service |
| `/v1/vehicle-tasks` | gateway | task proxy | vehicle-service |
| `/v1/providers` | gateway | provider proxy | provider-service |
| `/v1/products` | gateway | product proxy | provider-service |
| `/v1/purchases` | gateway | purchase proxy | provider-service |
| `/v1/purchase-requests` | gateway | purchase request proxy | provider-service |
| `/v1/supplies` | gateway | supplies proxy | provider-service |
| `/v1/stocks` | gateway | stock proxy | provider-service |

## Dependencies

**Internal:** inventory-service, vehicle-service, provider-service, notification-service, reference-service

**External:** Express, `http-proxy-middleware`, environment-provided downstream URLs

## Patterns Discovered

- Versioning is centralized with `API_VERSION = "v1"`.
- Proxy routers authenticate before forwarding.
- User context is propagated with `forwardUserHeaders`.
- Proxy handlers rewrite paths using `req.originalUrl`, so the downstream service sees the original versioned URL.
- CORS headers from target services are stripped and replaced by gateway-managed ones.

## Data Flow

Client request -> gateway shared middlewares -> gateway auth middleware -> forwarded headers added -> request proxied to the downstream service -> gateway normalizes CORS on the response.

For the current "ticketing" exploration, the gateway does not implement a ticket domain itself. It exposes candidate workflows through `/v1/purchase-requests` and `/v1/vehicle-tasks`.

## Notes for Future Queries

- There is no explicit `ticket` route name in the gateway.
- `products.proxy.router.ts` is where `purchase-requests` and `purchases` are published.
- Route naming is centralized in `src/config/services.ts`, which is a good lookup point before exploring a service.

## Explored

`2026-04-21T00:00:00Z`
