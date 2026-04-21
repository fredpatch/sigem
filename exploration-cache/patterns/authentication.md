# Authentication

## Observed So Far

- Gateway authenticates before proxying service routes.
- Downstream services also enforce `authenticate`, so auth is layered rather than trusted only at the edge.
- Writes are commonly protected by `authorizedRoles(...)`.
- Mutation routes often attach `audit(...)` after auth and before controllers.
