# Infra - Explored 2026-04-21

## Scope

Deployment and compose files relevant to the stock module and on-prem behavior.

## Key Files

- `infra/compose/docker-compose.base.yml`
- `infra/compose/docker-compose.deploy.yml`
- `infra/compose/docker-compose.local.yml`
- `infra/compose/onprem/docker-compose.api-gateway.yml`
- `infra/compose/onprem/docker-compose.provider.yml`
- `infra/compose/onprem/docker-compose.client.yml`
- `infra/docker/nginx.conf`

## Findings

- Browser traffic goes to the client nginx, which rewrites `/api/*` to `/v1/*` before proxying to `api-gateway`.
- `api-gateway` expects `PROVIDER_SERVICE_URL=http://provider-service:4010` in compose-based deployments.
- On-prem pilot commands (`onprem:pilot:*`) start only `core`, `vehicle-service`, `api-gateway`, and `client`.
- `provider-service` is not included in the pilot slice, so stock endpoints behind `/v1/stocks`, `/v1/providers`, `/v1/purchases`, and `/v1/supplies` cannot function there.
- On-prem documentation explicitly states that `inventory-service` is not part of the on-prem rollout, which reinforces that stock ownership is not there.

## Deployment-Sensitive Risks

- Gateway may start healthy while stock functionality is still broken because `provider-service` is outside the pilot stack.
- Client nginx rewrites both `/api/v1/*` and `/api/*` into `/v1/*`, so browser calls without `/v1` still work as long as the gateway is reachable.
- On-prem correctness depends on `.env.onprem` matching gateway and provider service ports and hostnames.

## Explored

`2026-04-21T18:30:00Z`
