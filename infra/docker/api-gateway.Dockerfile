FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm ci

COPY tsconfig*.json ./
COPY configs ./configs
COPY packages ./packages
COPY services/api-gateway ./services/api-gateway

RUN npm run build -w @sigem/api-gateway

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/api-gateway/package*.json ./services/api-gateway/

RUN npm ci --omit=dev

COPY --from=build /app/services/api-gateway/dist ./services/api-gateway/dist

WORKDIR /app/services/api-gateway

EXPOSE 4000

CMD ["node", "dist/server.js"]