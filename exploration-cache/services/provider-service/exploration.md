# Provider Service - Explored 2026-04-21

## Path

`services/provider-service/`

## Purpose

Handles provider, product, purchasing, supply, and stock workflows. For the current investigation, `purchase-requests` is the clearest match to a ticket-like lifecycle.

## Key Files

- `src/app.ts` - mounts provider-service route families
- `src/routes/purchase-request.route.ts` - purchase request endpoints
- `src/controllers/purchase-request.controller.ts` - validation and controller orchestration
- `src/services/purchase-requests.service.ts` - core lifecycle and conversion logic
- `src/validators/purchase-request.schema.ts` - request schema and allowed status values
- `src/routes/purchases.route.ts` - purchase lifecycle endpoints
- `src/modules/supplies/routes/supplies.route.ts` - supply planning routes adjacent to purchasing workflow

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

## Data Flow

Client -> gateway `/v1/purchase-requests` -> provider-service auth/roles/audit -> controller validation -> `PurchaseRequestsService` -> Mongo transaction creates request header and lines -> later status transitions advance the request -> `convert` creates a purchase and marks the request as `CONVERTED`.

## Notes for Future Queries

- There is no domain object literally named `ticket`; `purchase-request` is the strongest current candidate.
- Statuses are: `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `ORDERED`, `RECEIVED`, `CANCELLED`, `CONVERTED`.
- Allowed transition actions currently exposed are: `submit`, `approve`, `reject`, `order`, `receive`, `cancel`.
- Comment in service suggests the model could later store `purchaseId` on conversion.

## Explored

`2026-04-21T00:00:00Z`
