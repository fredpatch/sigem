# SIGEM Quick Reference

## Pattern Status

| Pattern | Status | Location in Cache |
| --- | --- | --- |
| Ticket lifecycle | Cached | `query-cache/ticket-lifecycle.md` |
| Service communication | Cached | `patterns/communication-patterns.md` |
| Authentication | Cached | `patterns/authentication.md` |
| Error handling | Cached | `patterns/error-handling.md` |
| Stock module audit | Cached | `query-cache/stock-module-audit.md` |
| Stock default-location fix | Cached | `query-cache/stock-default-location-fix.md` |
| Supplies dashboard audit | Cached | `query-cache/supplies-dashboard-audit.md` |
| Supplies dashboard visual refinement | Cached | `query-cache/supplies-dashboard-visual-refinement.md` |

## Service Responsibilities

| Service | Actual responsibility | Status |
| --- | --- | --- |
| api-gateway | Browser-facing entrypoint and proxy to downstream services | Partial |
| inventory-service | Asset/catalog domain, not stock ledger ownership | Partial |
| provider-service | Providers, purchases, supplies, stock items, stock movements, stock KPIs | Partial |
| vehicle-service | Vehicle domain | Not started |
| notification-service | Notifications and websocket | Not started |
| log-service | Logging | Not started |
| reference-service | Reference data | Not started |

## Known Dependencies

- Frontend stock module calls `/stocks/*` through `VITE_GATEWAY_URL`.
- Gateway proxies `/v1/stocks` to `PROVIDER_SERVICE_URL`.
- `provider-service` owns stock persistence in Mongo through `StockItem`, `StockMovement`, and `StockLocation`.
- Procurement delivery auto-injects stock from `supply-plan` when status becomes `DELIVERED`.
- Backend now auto-ensures a default stock location on stock-location reads and on stock movement creation when `locationId` is omitted.

## Stock Ownership Summary

- Stock items: `provider-service`
- Stock movements: `provider-service`
- Suppliers/providers: `provider-service`
- Procurement/supplies: `provider-service`
- Asset/inventory catalog: `inventory-service` only
- Gateway: transport layer only, not stock owner

## Deployment-Sensitive Notes

- On-prem pilot stack excludes `provider-service`, so `/stocks` cannot work in that slice.
- On-prem runbooks explicitly say `inventory-service` is not part of the on-prem deployment.
- Gateway stock proxy depends on `PROVIDER_SERVICE_URL` even though the thrown error text still mentions `INVENTORY_SERVICE_URL`.
- Stock routes require cookie auth and MG roles; missing auth cookies or unauthorized roles fail before reaching stock logic.
- `StockLocationController.getStockLocations` returns `201` for a read route.
- `StockService` does not actually emit stock events despite comments claiming it does.
- Default stock location is now self-healing in `provider-service`; frontend should no longer need manual `/stocks/locations/init` before first use.
- Supplies dashboard now surfaces monthly trend, amount by status, supplier concentration, stale prices, and item/plan risk counts without introducing a new backend route.
- Supplies dashboard visual polish now uses smaller KPI typography, quieter secondary cards, tighter spacing, lighter chart chrome, and custom compact tooltips while preserving the same KPI set.

---

**Last Updated:** 2026-04-21T19:42:00Z
**Next Priority:** Decide whether supplies KPIs should pivot from `createdAt` to operational milestones such as `scheduledFor`, `ORDERED`, or `DELIVERED` for more business-accurate trend reporting.
