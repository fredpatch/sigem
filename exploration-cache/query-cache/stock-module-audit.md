# Stock Module Audit

## Question

Audit the stock module end to end and identify interoperability failures between services, especially deployment/runtime mismatches that only appear on-prem.

## Short Answer

The stock domain belongs to `provider-service`, not `inventory-service`.

The most likely on-prem failure is deployment-level: the documented and scripted on-prem pilot stack excludes `provider-service`, while the frontend and gateway both route stock traffic to `provider-service`.

## Ownership Summary

- Stock items: `services/provider-service/src/modules/ledger/models/stock-item.model.ts`
- Stock movements: `services/provider-service/src/modules/ledger/models/stock-movement.model.ts`
- Stock locations: `services/provider-service/src/modules/ledger/models/stock-location.model.ts`
- Suppliers/providers: `services/provider-service/src/routes/provider.routes.ts`
- Procurement/supplies: `services/provider-service/src/modules/supplies/routes/supplies.route.ts`
- Procurement delivery -> stock injection: `services/provider-service/src/modules/supplies/services/supply-plan.service.ts`
- Gateway transport: `services/api-gateway/src/routes/stocks.proxy.router.ts`
- Frontend entrypoint: `apps/web/src/modules/stocks/api/stock.api.ts`

## Highest-Signal Findings

1. On-prem pilot deployment omits `provider-service`, but stock UI depends on it.
2. Gateway routes `/v1/stocks` to `PROVIDER_SERVICE_URL`, confirming stock is not owned by `inventory-service`.
3. `inventory-service` has no audited stock route or stock persistence implementation.
4. Stock read routes are protected by write-role middleware, making authorization failures possible in on-prem even for reads.
5. Comments claim stock events are emitted, but the audited stock service implementation does not emit them.
6. `getStockLocations` returns `201` on GET, which is odd and can confuse strict clients or monitoring.

## Supporting Files

- `infra/compose/onprem/README.md`
- `package.json`
- `infra/compose/onprem/docker-compose.api-gateway.yml`
- `infra/compose/onprem/docker-compose.provider.yml`
- `apps/web/src/modules/stocks/api/stock.api.ts`
- `services/api-gateway/src/routes/stocks.proxy.router.ts`
- `services/provider-service/src/modules/ledger/routes/stock.routes.ts`
- `services/provider-service/src/modules/ledger/services/stock.service.ts`

## Timestamp

`2026-04-21T18:30:00Z`
