# Inventory Models

## Asset

- Primary identity includes generated `code`
- Linked to `categoryId` and `locationId`
- Carries tracking fields such as `serialNumber`, `brand`, `model`, `quantity`, and `unit`
- Lifecycle-ish field: `situation`

## Observed Lifecycle Values

- `NEUF`
- `EN_SERVICE`
- `EN_PANNE`
- `HORS_SERVICE`
- `REFORME`

## Ticketing Relevance

- No ticket model found in the sampled inventory files
- Asset state may still be the downstream subject of a request, task, or maintenance workflow handled elsewhere
