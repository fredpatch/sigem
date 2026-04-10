# On-prem Pilot Compose

This folder contains the first on-prem deployment slice for SIGEM.

Current pilot scope:
- shared core infra: `mongo`
- pilot backend: `vehicle-service`
- pilot gateway: `api-gateway`
- pilot frontend: `client`

The goal is to start each service independently and debug it without taking down the rest of the platform.

## 1. Prepare env

Copy the example file:

```powershell
Copy-Item infra/compose/onprem/.env.onprem.example infra/compose/onprem/.env.onprem
```

Fill in the real values before the first deployment.

## 2. Bring up the pilot stack step by step

Start core only:

```powershell
npm run onprem:core:up
```

Start the pilot service:

```powershell
npm run onprem:vehicle:up
```

Then add the gateway:

```powershell
npm run onprem:gateway:up
```

Then add the client:

```powershell
npm run onprem:client:up
```

Or bring up the whole pilot slice at once:

```powershell
npm run onprem:pilot:up
```

## 3. Debugging

Follow logs:

```powershell
npm run onprem:pilot:logs
```

Check one service:

```powershell
docker compose --env-file infra/compose/onprem/.env.onprem `
  -f infra/compose/onprem/docker-compose.core.yml `
  -f infra/compose/onprem/docker-compose.vehicle.yml `
  ps
```

Stop one service without taking everything down:

```powershell
docker compose --env-file infra/compose/onprem/.env.onprem `
  -f infra/compose/onprem/docker-compose.core.yml `
  -f infra/compose/onprem/docker-compose.vehicle.yml `
  stop vehicle-service
```

## 4. Notes

- `api-gateway` is wired so the vehicle routes work first. Other upstreams stay configurable through env and can be added later service by service.
- The client still carries the socket.io proxy path in nginx. Without `notification-service`, real-time features may be unavailable during the pilot, which is acceptable for this first slice.
- Healthchecks are defined for the pilot services to make startup order and debugging easier.
