# SIGEM On-Prem Runbook

This folder contains the on-prem Docker Compose layout used to run SIGEM on the server.

The deployment model is service-by-service:

- shared infra: `mongo`
- API entrypoint: `api-gateway`
- frontend: `client`
- domain services started independently:
  - `vehicle-service`
  - `reference-service`
  - `notification-service`
  - `log-service`
  - `provider-service`

The goal is to be able to start, stop, restart, and debug one service without taking down the whole platform.

## 1. Server prerequisites

Install these on the server first:

- `git`
- `node` 20.x
- `npm`
- `docker`
- Docker Compose plugin (`docker compose`)

Quick checks:

```bash
node -v
npm -v
docker -v
docker compose version
```

## 2. Clone the project on the server

Example:

```bash
git clone https://github.com/fredpatch/sigem.git
cd sigem
```

Install workspace dependencies once:

```bash
npm install
```

## 3. Prepare the on-prem environment file

Create the runtime env file from the example:

```bash
cp infra/compose/onprem/.env.onprem.example infra/compose/onprem/.env.onprem
```

Then edit:

```bash
nano infra/compose/onprem/.env.onprem
```

Review these values carefully before the first startup:

- `PUBLIC_URL`
- `CLIENT_PORT`
- `API_GATEWAY_PORT`
- `NOTIFICATION_SERVICE_PORT`
- `VEHICLE_SERVICE_PORT`
- `REFERENCE_SERVICE_PORT`
- `PROVIDER_SERVICE_PORT`
- `LOG_SERVICE_PORT`
- `MONGO_ROOT_USERNAME`
- `MONGO_ROOT_PASSWORD`
- `MONGO_DATABASE`
- `MARIADB_HOST`
- `MARIADB_PORT`
- `MARIADB_USER`
- `MARIADB_PASSWORD`
- `MARIADB_DATABASE`
- `KAFKA_BROKERS`
- `KAFKA_SSL`
- `KAFKA_SASL_ENABLED`
- `BOOTSTRAP_SUPER_ADMIN_ENABLED`
- `BOOTSTRAP_SUPER_ADMIN_MATRICULATION`
- `BOOTSTRAP_SUPER_ADMIN_USERNAME`
- `BOOTSTRAP_SUPER_ADMIN_PASSWORD`
- `BOOTSTRAP_SUPER_ADMIN_EMAIL`

Notes:

- If Kafka is not available yet, leave `KAFKA_BROKERS=` empty and use the no-Kafka mode expected by the services.
- `PUBLIC_URL` should match the real URL used by users on the server, for example `http://server-ip:8080` or your internal DNS name.
- For production-like deployment, prefer `NODE_ENV=production`.

## 4. Build and start from the server

All commands below are run from the repository root:

```bash
cd /path/to/sigem
```

### Step 1: start shared infra

```bash
npm run onprem:core:up
```

This starts Mongo only.

### Step 2: start backend services one by one

Start the services in this order:

```bash
npm run onprem:vehicle:up
npm run onprem:reference:up
npm run onprem:notification:up
npm run onprem:log:up
npm run onprem:provider:up
```

Then start the gateway:

```bash
npm run onprem:gateway:up
```

Then start the frontend:

```bash
npm run onprem:client:up
```

## 5. Suggested first deployment order

For a fresh server rollout, use this sequence:

1. `npm run onprem:core:up`
2. `npm run onprem:vehicle:up`
3. `npm run onprem:gateway:up`
4. `npm run onprem:client:up`
5. `npm run onprem:reference:up`
6. `npm run onprem:notification:up`
7. `npm run onprem:log:up`
8. `npm run onprem:provider:up`

This keeps the rollout incremental and makes troubleshooting easier.

## 6. Check container status on the server

List running containers:

```bash
docker ps
```

Check the on-prem stack specifically:

```bash
docker compose --env-file infra/compose/onprem/.env.onprem \
  -f infra/compose/onprem/docker-compose.core.yml \
  -f infra/compose/onprem/docker-compose.vehicle.yml \
  -f infra/compose/onprem/docker-compose.api-gateway.yml \
  -f infra/compose/onprem/docker-compose.client.yml \
  ps
```

## 7. Follow logs on the server

Pilot stack logs:

```bash
npm run onprem:pilot:logs
```

One container only:

```bash
docker logs -f sigem-onprem-api-gateway
docker logs -f sigem-onprem-vehicle-service
docker logs -f sigem-onprem-notification-service
docker logs -f sigem-onprem-provider-service
docker logs -f sigem-onprem-reference-service
docker logs -f sigem-onprem-log-service
docker logs -f sigem-onprem-client
```

## 8. Stop or restart one service without stopping the rest

Stop one service:

```bash
npm run onprem:provider:down
```

Restart one service by starting it again:

```bash
npm run onprem:provider:up
```

You can do the same with:

- `onprem:vehicle:*`
- `onprem:reference:*`
- `onprem:notification:*`
- `onprem:log:*`
- `onprem:gateway:*`
- `onprem:client:*`

## 9. Bring down the pilot slice

```bash
npm run onprem:pilot:down
```

This stops the pilot stack defined by:

- `core`
- `vehicle-service`
- `api-gateway`
- `client`

## 10. Health checks

Examples from the server:

```bash
curl http://localhost:4000/v1/health
curl http://localhost:4003/v1/health
curl http://localhost:4006/v1/health
curl http://localhost:4001/v1/health
curl http://localhost:4004/v1/health
curl http://localhost:4010/v1/health
curl http://localhost:8080
```

Adjust ports if you changed them in `.env.onprem`.

## 11. Updating the project on the server

After pulling new code:

```bash
git pull origin main
npm install
```

Then rebuild only the service you changed by running its `onprem:*:up` script again.

Examples:

```bash
npm run onprem:provider:up
npm run onprem:notification:up
npm run onprem:gateway:up
```

## 12. Operational notes

- `api-gateway` is the browser-facing entrypoint for backend APIs.
- Internal services should be reached through the gateway from the client.
- `notification-service` depends on socket proxying through the client nginx config.
- `provider-service`, `reference-service`, and `vehicle-service` can all be restarted independently.
- `inventory-service` is not part of this on-prem rollout yet.
- Keep `.env.onprem` on the server and do not commit it with server secrets.
