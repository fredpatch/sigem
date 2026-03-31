FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/vehicle-service/package*.json ./services/vehicle-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/vehicle-service/src ./services/vehicle-service/src
COPY services/vehicle-service/tsup.config.ts ./services/vehicle-service/
COPY services/vehicle-service/tsconfig.json ./services/vehicle-service/

RUN npm run build -w @sigem/vehicle-service

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/vehicle-service/package*.json ./services/vehicle-service/

RUN npm ci --omit=dev

COPY --from=build /app/services/vehicle-service/dist ./services/vehicle-service/dist

WORKDIR /app/services/vehicle-service
EXPOSE 4003
CMD ["node", "dist/server.js"]
