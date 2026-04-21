# Supplies Dashboard Audit

## Question

Audit the current Fournitures dashboard, identify feasible KPIs/charts from existing backend data, and implement a minimal improvement.

## Implemented Answer

The dashboard was upgraded with a minimal backend/frontend extension centered on existing `provider-service` supplies data:

- `services/provider-service/src/modules/supplies/supply.helpers.ts`
- `services/provider-service/src/modules/supplies/services/supply-dashboard.service.ts`
- `apps/web/src/modules/supplier/_components/SupplyKPIDashboard.tsx`

## What Changed

- Kept the existing `/supplies/dashboard` endpoint and extended its DTO instead of adding a new route.
- Added active plan count, at-risk active plan count, amount-by-status, monthly trend, stale price count, active item risk count, and top-supplier share.
- Enriched top supplier and top item charts with labels resolved from provider/item collections.
- Reworked the dashboard UI around decision-oriented cards and charts:
  - total planned amount
  - active plans and plans at risk
  - price coverage and items without price
  - items at risk and stale prices
  - top supplier concentration
  - monthly trend
  - amount by status
  - top suppliers and top items by amount

## Validation

- `npm run build -w @sigem/provider-service` succeeded on 2026-04-21.
- `npm run build -w @sigem/client` still fails, but the failures are pre-existing unrelated TypeScript issues outside the supplies dashboard area.

## Remaining Risk

- The dashboard still depends on plan `createdAt` for the selected range, not lifecycle timestamps such as ordered or delivered dates.
- Risk metrics are intentionally minimal: an item is considered at risk when it has no price or only stale prices older than 30 days.
- Frontend full build health remains blocked by unrelated existing errors elsewhere in the app.

## Timestamp

`2026-04-21T19:25:00Z`
