FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/provider-service/package*.json ./services/provider-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/provider-service/src ./services/provider-service/src
COPY services/provider-service/tsup.config.ts ./services/provider-service/
COPY services/provider-service/tsconfig.json ./services/provider-service/

RUN npm run build -w @sigem/provider-service

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/provider-service/package*.json ./services/provider-service/

RUN npm ci --omit=dev

COPY --from=build /app/services/provider-service/dist ./services/provider-service/dist

WORKDIR /app/services/provider-service
EXPOSE 4010
CMD ["node", "dist/server.js"]
