FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm ci

FROM deps AS build

COPY tsconfig.json ./
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway

RUN npm run build -w @sigem/shared
RUN npm run build -w @sigem/api-gateway

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm ci --omit=dev

COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway

EXPOSE 4000

CMD ["node", "dist/server.js"]