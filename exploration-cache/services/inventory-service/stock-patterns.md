# Stock Patterns

Stock management does not appear to live in `inventory-service` based on the initial sample.

Current evidence points instead to `provider-service`:

- `/v1/stocks` is proxied from the gateway to `provider-service`
- `provider-service` contains `modules/ledger/routes/stock.routes.ts`

Follow-up recommendation:

- Treat `inventory-service` as asset/catalog domain
- Treat `provider-service` as purchasing/supply/stock workflow domain
