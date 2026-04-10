FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/notification-service/package*.json ./services/notification-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/notification-service/src ./services/notification-service/src
COPY services/notification-service/tsup.config.ts ./services/notification-service/
COPY services/notification-service/tsconfig.json ./services/notification-service/

RUN npm run build -w @sigem/notification-service
RUN npm prune --omit=dev

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=build /app/package.json ./package.json

WORKDIR /app/services/notification-service
EXPOSE 4001
CMD ["node", "dist/server.cjs"]
