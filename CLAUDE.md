# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # All services concurrently (gateway, inventory, vehicle, notify, log, client)
npm run dev:api      # Backend services only (7 services + shared watch)
npm run dev:frontend # Frontend only (Vite dev server, port 5173)
npm run dev:gateway  # Single service — replace "gateway" with service name
```

### Build & Type-check
```bash
npm run build        # tsc -b (project references, all packages)
npm run build:clean  # Clean all dist/ outputs then rebuild
npm run watch        # Incremental watch mode across all packages
```

### Lint & Format
```bash
npm run lint         # ESLint 9 across all workspaces
npm run format       # Prettier write
```

There is no root-level test runner configured. Check individual service `package.json` for service-level tests.

## Architecture

**Monorepo** via npm workspaces (no Turbo). TypeScript project references wire everything together via `tsconfig.base.json`.

```
apps/web/               React 19 + Vite 6 frontend (port 5173)
services/
  api-gateway/          Express proxy layer — all client traffic enters here (port 4000)
  inventory-service/    Port 4002
  vehicle-service/      Port 4003
  notification-service/ Port 4001 — Socket.io + Kafka consumer
  log-service/          Kafka consumer → MongoDB/Winston logging
  reference-service/    Port 4006 — Socket.io + Kafka
  provider-service/     Port 4010 — Socket.io + Kafka
packages/
  shared/               Shared types, DTOs, Zod schemas, Mongoose models, JWT middleware
  api-clients/          Typed HTTP clients for inter-service calls
  feature-flags/        Feature flag utilities
  configs/              Shared config management
infra/
  compose/              docker-compose.{base,dev,staging}.yml
  k8s/                  Kubernetes manifests
  docker/               Per-service Dockerfiles
```

### Key Patterns

- **API Gateway** is the single entry point. It proxies requests to downstream services via `http-proxy-middleware` and handles auth (JWT), CORS, and rate limiting.
- **Event bus** lives in `packages/shared/src/kafka/event-bus.ts`. Services publish/consume domain events via Kafka (`kafkajs`). Set `EVENTS_DRIVER=kafka` in env; defaults to noop.
- **Shared package** (`@sigem/shared`) provides Mongoose models, Zod validation schemas, JWT helpers, and typed Kafka topic constants. Import from this — don't duplicate in services.
- **Real-time** (Socket.io) is handled inside individual services (notification, reference, provider), not the gateway.
- **Frontend** uses TanStack Query for server state, Zustand for client state, React Hook Form + Zod for forms, Radix UI + Tailwind CSS 4 for UI.

### Data Stores

- **MongoDB** — primary store for most services (connection via `MONGO_URL`)
- **MariaDB** — used in specific services (`MARIADB_*` env vars)
- **Kafka** — async inter-service messaging (`KAFKA_BROKERS`, `KAFKA_CLIENT_ID`)

### Build output

Each service/package builds to its own `dist/` via `tsup` (configured from `configs/tsup.backend.base.ts`) or `tsc`. Frontend builds via Vite. The `tsconfig.build.json` in services excludes test files for production builds.
