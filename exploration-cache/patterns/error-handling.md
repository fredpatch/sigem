# Error Handling

## Observed So Far

- Gateway returns a structured 404 with suggestions for unknown routes.
- Provider-service controllers use `catchError` wrappers.
- Inventory-service uses validation middleware and centralized middleware stacks.
- Purchase request detail and conversion return `404` when the request is missing.

## Follow-up

- Explore service-level error middleware implementations for consistent response shapes.
