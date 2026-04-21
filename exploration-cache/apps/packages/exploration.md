# Packages - Explored 2026-04-21

## Scope

Shared package behavior relevant to stock interoperability.

## Key Files

- `packages/shared/src/http/request.ts`
- `packages/shared/src/middleware/express.ts`
- `packages/shared/src/events/emit.ts`
- `packages/shared/src/auth/jwt.ts`

## Findings

- `getActor(req)` can read actor identity either from `req.user` or forwarded `x-user-*` headers.
- Shared middleware initializes CORS, JSON parsing, cookies, and logging.
- Event emission is generic and topic-based, but stock-specific event emission is not wired from the audited stock service code.
- JWT verification depends on `JWT_SECRET` parity across services.

## Explored

`2026-04-21T18:30:00Z`
