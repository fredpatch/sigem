# Inventory Service - Explored 2026-04-21

## Path

`services/inventory-service/`

## Purpose

Manages core inventory entities such as assets, categories, and locations. This appears to be a catalog and tracking service rather than the place where ticket-like workflows originate.

## Key Files

- `src/routes/inventory.route.ts` - category route sample showing auth, roles, validation, audit
- `src/models/asset.model.ts` - asset schema with generated business code and lifecycle fields

## Main Functions/Endpoints

| Endpoint | Method | Purpose | Called By |
| --- | --- | --- | --- |
| `/` on category routes | GET | list categories | gateway/client |
| `/:id` on category routes | GET | get one category | gateway/client |
| `/` on category routes | POST | create category | privileged users |
| `/:id` on category routes | PATCH | update category | privileged users |
| `/:id/delete` on category routes | DELETE | soft delete category | privileged users |

## Dependencies

**Internal:** authentication middleware, role authorization, audit middleware, code generation service

**External:** Mongoose, Zod

## Patterns Discovered

- Write operations are role-gated using a shared role list.
- Request bodies are validated before controller execution.
- Audit hooks are attached to mutations.
- Assets receive generated business codes on validation.

## Data Flow

Authenticated request -> validation/authorization/audit middleware -> controller/service -> Mongoose model persistence.

At this stage, no explicit ticket entity or request lifecycle was found in the sampled inventory files.

## Notes for Future Queries

- Asset state is modeled through `situation` values such as `EN_SERVICE` and `EN_PANNE`.
- Asset code generation happens automatically in a schema hook, which may matter if downstream workflows create inventory entries from another service.
- Next useful files: `src/routes/index.ts`, `src/controllers/asset.controller.ts`, `src/services/asset.service.ts`.

## Explored

`2026-04-21T00:00:00Z`
