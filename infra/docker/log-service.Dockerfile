FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/log-service/package*.json ./services/log-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/log-service/src ./services/log-service/src
COPY services/log-service/tsup.config.ts ./services/log-service/
COPY services/log-service/tsconfig.json ./services/log-service/

RUN npm run build -w @sigem/log-service
RUN npm prune --omit=dev

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/log-service/dist ./services/log-service/dist
COPY --from=build /app/package.json ./package.json

WORKDIR /app/services/log-service
# log-service is a Kafka consumer; expose only if it has an HTTP health endpoint
EXPOSE 4004
CMD ["node", "dist/server.cjs"]
