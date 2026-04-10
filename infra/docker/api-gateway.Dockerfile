FROM node:20-alpine AS build
# python3/make/g++ required to compile snappy (native Kafka compression module)
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/api-gateway/src ./services/api-gateway/src
COPY services/api-gateway/tsup.config.ts ./services/api-gateway/
COPY services/api-gateway/tsconfig.json ./services/api-gateway/

# tsup bundles @sigem/shared inline → dist/server.cjs
RUN npm run build -w @sigem/api-gateway

# Strip devDependencies in place so the runtime stage gets a clean copy
RUN npm prune --omit=dev

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy the pruned node_modules (includes compiled snappy .node binaries)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist
# package.json needed so Node resolves the workspace package root correctly
COPY --from=build /app/package.json ./package.json

WORKDIR /app/services/api-gateway
EXPOSE 4000
CMD ["node", "dist/server.cjs"]
