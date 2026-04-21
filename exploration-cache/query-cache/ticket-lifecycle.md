# Ticket Lifecycle Query

## Question

Explore the ticketing pattern across services.

## Current Answer

There is no explicit `ticket` domain term in the sampled backend files.

The closest implemented lifecycle is `provider-service` purchase requests:

1. Create request with one or more product lines
2. Transition through `DRAFT -> SUBMITTED -> APPROVED/REJECTED -> ORDERED -> RECEIVED`
3. Convert a `RECEIVED` request into a purchase
4. Mark request as `CONVERTED`

## Entry Points

- Gateway publication: `/v1/purchase-requests`
- Service implementation: `services/provider-service/src/routes/purchase-request.route.ts`
- Lifecycle logic: `services/provider-service/src/services/purchase-requests.service.ts`

## Secondary Candidate

- `/v1/vehicle-tasks` may represent an operational task-ticket workflow, but it has not been explored yet.

## Open Questions

- Does the business team call purchase requests "tickets" informally?
- Are vehicle tasks or maintenance records the real ticketing workflow instead?
