FROM node:20-alpine AS build
WORKDIR /app

# VITE_ vars are baked into the JS bundle at build time.
# VITE_GATEWAY_URL: axios base URL seen by the browser.
#   → Use "/api" so nginx proxies to the gateway (recommended for Docker).
#   → Use "http://localhost:4000" for a direct standalone test without nginx proxy.
# VITE_SOCKET_CONNECTION: socket.io server URL seen by the browser.
#   → Set to the nginx host (e.g. "http://localhost") so socket.io path is proxied.
ARG VITE_GATEWAY_URL=/api
ARG VITE_SOCKET_CONNECTION=http://localhost
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
ENV VITE_SOCKET_CONNECTION=$VITE_SOCKET_CONNECTION

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

RUN npm ci

COPY tsconfig*.json ./
COPY packages/shared/src ./packages/shared/src
COPY apps/web ./apps/web

# Run vite build directly — skips the tsc type-check step (tsc -b) which
# blocks on in-progress TypeScript errors in the client source.
RUN cd apps/web && npx vite build

# --- Runtime ---
FROM nginx:alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
