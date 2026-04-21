# Supplies Dashboard Visual Refinement

## Question

Apply a minimal visual refinement pass to the Fournitures dashboard without changing the KPI set or backend data architecture.

## Implemented Answer

The refinement was kept UI-only and limited to the existing dashboard component:

- `apps/web/src/modules/supplier/_components/SupplyKPIDashboard.tsx`

## What Changed

- Reduced KPI typography so values feel closer to an admin backoffice than a marketing dashboard.
- Kept one primary KPI emphasis on planned amount and quieted the other cards.
- Tightened card padding and chart heights slightly for better density.
- Made chart titles, subtitles, badges, axes, and legends more discreet.
- Reduced chart visual weight by softening grids, shrinking ticks, and slightly reducing radii/stroke sizes.
- Replaced default chart tooltips with a compact custom tooltip card so hover states feel cleaner and more consistent with the admin UI.

## Scope Guardrails Kept

- No backend changes
- No new charts
- No new KPI cards
- No changes outside the Fournitures dashboard component

## Timestamp

`2026-04-21T19:42:00Z`
