# Data Flow

## Purchase Request Flow

1. Client calls `/v1/purchase-requests` through `api-gateway`.
2. Gateway authenticates and forwards user context.
3. `provider-service` validates payload and creates request header plus line snapshots in Mongo.
4. Later actions transition status through procurement stages.
5. `convert` turns a received request into a purchase record.

## Asset Flow

1. Client calls inventory endpoints through the gateway.
2. Inventory middleware stack authenticates, authorizes, validates, and audits.
3. Asset persistence generates a business code automatically when missing.
