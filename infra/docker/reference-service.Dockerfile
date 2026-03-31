FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/reference-service/package*.json ./services/reference-service/

RUN npm ci

COPY tsconfig*.json ./
COPY configs/ ./configs/
COPY packages/shared/src ./packages/shared/src
COPY services/reference-service/src ./services/reference-service/src
COPY services/reference-service/tsup.config.ts ./services/reference-service/
COPY services/reference-service/tsconfig.json ./services/reference-service/

RUN npm run build -w @sigem/reference-service

# --- Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/reference-service/package*.json ./services/reference-service/

RUN npm ci --omit=dev

COPY --from=build /app/services/reference-service/dist ./services/reference-service/dist

WORKDIR /app/services/reference-service
EXPOSE 4006
CMD ["node", "dist/index.js"]
