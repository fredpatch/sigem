# Provider Service - Explored 2026-04-21

## Path

`services/provider-service/`

## Purpose

Handles provider, product, purchasing, supply, and stock workflows. For the stock audit, this service is the actual owner of the stock ledger domain.

## Key Files

- `src/app.ts` - mounts provider-service route families
- `src/routes/purchase-request.route.ts` - purchase request endpoints
- `src/controllers/purchase-request.controller.ts` - validation and controller orchestration
- `src/services/purchase-requests.service.ts` - core lifecycle and conversion logic
- `src/validators/purchase-request.schema.ts` - request schema and allowed status values
- `src/routes/purchases.route.ts` - purchase lifecycle endpoints
- `src/modules/supplies/routes/supplies.route.ts` - supply planning routes adjacent to purchasing workflow
- `src/modules/ledger/routes/stock.routes.ts` - stock ledger endpoints
- `src/modules/ledger/controller/stock.controller.ts` - stock list, movement, KPI, and threshold handlers
- `src/modules/ledger/services/stock.service.ts` - stock mutation logic and persistence rules
- `src/modules/ledger/services/stock-kpi.service.ts` - dashboard read model
- `src/modules/ledger/models/stock-item.model.ts` - stock item persistence
- `src/modules/ledger/models/stock-movement.model.ts` - stock movement persistence
- `src/modules/ledger/models/stock-location.model.ts` - stock location persistence
- `src/modules/ledger/services/stock-location.service.ts` - default location bootstrap and lookup
- `src/modules/supplies/services/supply-plan.service.ts` - procurement delivery auto-injects stock
- `src/routes/provider.routes.ts` - provider ownership and lookup

## Main Functions/Endpoints

| Endpoint | Method | Purpose | Called By |
| --- | --- | --- | --- |
| `/v1/purchase-requests` | GET | list requests | gateway/client |
| `/v1/purchase-requests/:id` | GET | request detail | gateway/client |
| `/v1/purchase-requests` | POST | create request | gateway/client |
| `/v1/purchase-requests/:id/action` | POST | transition request status | gateway/client |
| `/v1/purchase-requests/:id/convert` | POST | convert request to purchase | gateway/client |
| `/v1/purchases` | GET/POST | list or create purchase | gateway/client |
| `/v1/purchases/:id/confirm` | POST | confirm purchase | gateway/client |
| `/v1/purchases/:id/cancel` | DELETE | cancel purchase | gateway/client |
| `/v1/supplies/*` | mixed | supply planning workflow | gateway/client |
| `/v1/stocks/*` | mixed | stock ledger workflow | gateway/client |

## Dependencies

**Internal:** product model, purchase request model, purchase request line model, purchases service, auth, roles, audit middleware

**External:** Mongoose, Zod, shared response helper

## Patterns Discovered

- Requests and request lines are created transactionally in MongoDB sessions.
- Product fields are snapshotted into request lines at creation time.
- Request lifecycle is state-driven, with guarded transitions.
- A `RECEIVED` request can be converted into a confirmed purchase.
- Supplies and stocks live in this same service, which suggests it owns the procurement workflow end to end.
- Stock items are keyed by `(orgId, locationId, supplyItemId)` and stored in Mongo.
- Stock movements support `IN`, `OUT`, and `ADJUST`.
- `DELIVERED` supply plans trigger automatic `IN` stock movements through `SupplyPlanService.autoInStockFromPlan`.
- Stock KPI reads are derived from `StockItemModel` and `StockMovementModel`.
- Provider lookup is reused by stock movements and supplier price resolution.
- Supply dashboard read-model is served by `src/modules/supplies/services/supply-dashboard.service.ts`.
- Route-level auth for stock is strict: all stock endpoints require both authentication and an MG/admin write role, including read endpoints.
- Default stock location is now ensured automatically instead of requiring manual initialization.
- `getStockLocations()` now self-heals by creating the default location if none exists.
- Manual stock movement creation now falls back to the default location when `locationId` is omitted.
- A unique `(orgId, name)` index reduces duplicate default-location creation under concurrency.
- Supplies dashboard now aggregates monthly trend, amount by status, supplier concentration, stale prices, and risk counts directly from supply plans, supply items, supplier prices, and providers.

## Data Flow

Client -> gateway `/v1/purchase-requests` -> provider-service auth/roles/audit -> controller validation -> `PurchaseRequestsService` -> Mongo transaction creates request header and lines -> later status transitions advance the request -> `convert` creates a purchase and marks the request as `CONVERTED`.

For stock:

Client -> gateway `/v1/stocks/*` -> provider-service `authenticate` -> `authorizedRoles(MG_COS|MG_COB|MG_AGT|SUPER_ADMIN|ADMIN)` -> stock controller -> Mongo models in `modules/ledger`.

For procurement delivery to stock:

Client -> gateway `/v1/supplies/plans/:id/status` -> `SupplyPlanService.changeStatus()` -> when status enters `DELIVERED`, default stock location is resolved -> `StockService.createStockMovement()` creates `IN` movements and updates `StockItem`.

## Notes for Future Queries

- There is no domain object literally named `ticket`; `purchase-request` is the strongest current candidate.
- Statuses are: `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `ORDERED`, `RECEIVED`, `CANCELLED`, `CONVERTED`.
- Allowed transition actions currently exposed are: `submit`, `approve`, `reject`, `order`, `receive`, `cancel`.
- Comment in service suggests the model could later store `purchaseId` on conversion.
- The stock domain is not in `inventory-service`; it is implemented under `provider-service/src/modules/ledger`.
- `StockLocationController.getStockLocations()` now returns HTTP `200` for a GET route.
- `StockService` comments imply stock events are emitted, but no event emission was found in the implementation.
- On-prem rollout documentation starts the pilot stack without `provider-service`, which breaks stock routes unless the provider stack is started separately.
- The backend no longer relies on manual stock-location initialization before supply-plan delivery or first stock movement.
- Supplies dashboard trends currently use plan `createdAt`, which is simple and cheap but may differ from operational milestones.

## Explored

`2026-04-21T19:25:00Z`
