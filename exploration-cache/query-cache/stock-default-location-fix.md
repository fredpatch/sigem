# Stock Default Location Fix

## Question

Implement a minimal provider-service fix so the default stock location is automatically created if missing.

## Implemented Answer

The fix was implemented in `provider-service` with a small reusable path:

- `services/provider-service/src/modules/ledger/services/stock-location.service.ts`
- `services/provider-service/src/modules/ledger/controller/stock-location.controller.ts`
- `services/provider-service/src/modules/ledger/controller/stock.controller.ts`
- `services/provider-service/src/modules/ledger/models/stock-location.model.ts`
- `services/provider-service/src/modules/supplies/services/supply-plan.service.ts`

## Behavior

- If a stock location already exists in scope, reuse the oldest one.
- Otherwise create `Magasin principal` and return it.
- `GET /v1/stocks/locations` now self-heals and returns `200`.
- Manual `POST /v1/stocks/movements` can fall back to the default location when `locationId` is missing.
- Supply-plan delivery now auto-ensures the default location before stock injection.
- A unique `(orgId, name)` index reduces duplicate default-location creation under concurrency.

## Validation

- `npm run build -w @sigem/provider-service` succeeded on 2026-04-21.

## Remaining Risk

- Manual UI flows should no longer be blocked by missing stock location.
- A separate read/write role mismatch may still affect `/stocks` for users who can open the page in the frontend but lack backend stock roles.

## Timestamp

`2026-04-21T19:05:00Z`
