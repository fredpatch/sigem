FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/inventory-service/package*.json ./services/inventory-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/inventory-service/src ./services/inventory-service/src
COPY services/inventory-service/tsup.config.ts ./services/inventory-service/
COPY services/inventory-service/tsconfig.json ./services/inventory-service/

RUN npm run build -w @sigem/inventory-service

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/inventory-service/package*.json ./services/inventory-service/

RUN npm ci --omit=dev

COPY --from=build /app/services/inventory-service/dist ./services/inventory-service/dist

WORKDIR /app/services/inventory-service
EXPOSE 4002
CMD ["node", "dist/server.js"]
