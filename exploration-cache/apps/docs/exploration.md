# Docs - Explored 2026-04-21

## Scope

On-prem runbooks and deployment notes relevant to stock ownership and runtime behavior.

## Key Files

- `infra/compose/onprem/README.md`
- `infra/compose/onprem/README.fr.md`

## Findings

- The on-prem runbooks instruct users to start `provider-service` separately from the pilot slice.
- The suggested first deployment order starts `gateway` and `client` before `provider-service`.
- The documentation says `inventory-service` is not currently part of the on-prem deployment.

## Operational Meaning

- A user can reach the UI and gateway while every stock request still fails because the provider backend was never started in that rollout slice.
- Any diagnostic that assumes `inventory-service` owns stock on-prem is misdirected.

## Explored

`2026-04-21T18:30:00Z`
