#!/usr/bin/env bash
# Deploy api-gateway to a remote server via Docker.
#
# Required env vars (or set them below):
#   DEPLOY_HOST      — SSH host (e.g. user@192.168.1.10)
#   REGISTRY         — Docker registry prefix (e.g. ghcr.io/yourorg, or leave empty for local transfer)
#
# Optional:
#   IMAGE_TAG        — defaults to git short SHA
#   DEPLOY_DIR       — remote directory with .env and compose files (default: ~/sigem)
#   COMPOSE_FILE     — compose filename on the remote (default: docker-compose.base.yml)
#   SSH_KEY          — path to SSH private key (default: ~/.ssh/id_rsa)

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
DEPLOY_HOST="${DEPLOY_HOST:-}"
REGISTRY="${REGISTRY:-}"
IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
DEPLOY_DIR="${DEPLOY_DIR:-~/sigem}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.base.yml}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"

IMAGE_NAME="sigem/api-gateway"
FULL_IMAGE="${REGISTRY:+${REGISTRY}/}${IMAGE_NAME}:${IMAGE_TAG}"
LATEST_IMAGE="${REGISTRY:+${REGISTRY}/}${IMAGE_NAME}:latest"

# ── Validation ───────────────────────────────────────────────────────────────
if [[ -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: DEPLOY_HOST is not set (e.g. user@192.168.1.10)"
  exit 1
fi

SSH_OPTS=(-o StrictHostKeyChecking=no -i "$SSH_KEY")

# ── Resolve repo root (script can be called from anywhere) ───────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── 1. Build ─────────────────────────────────────────────────────────────────
echo "==> Building image: $FULL_IMAGE"
docker build \
  -f "$REPO_ROOT/infra/docker/api-gateway.Dockerfile" \
  -t "$FULL_IMAGE" \
  -t "$LATEST_IMAGE" \
  "$REPO_ROOT"

# ── 2. Deliver image to server ───────────────────────────────────────────────
if [[ -n "$REGISTRY" ]]; then
  echo "==> Pushing to registry: $FULL_IMAGE"
  docker push "$FULL_IMAGE"
  docker push "$LATEST_IMAGE"

  echo "==> Pulling on server"
  ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "docker pull $FULL_IMAGE && docker tag $FULL_IMAGE $LATEST_IMAGE"
else
  echo "==> No registry set — transferring image directly via SSH"
  docker save "$FULL_IMAGE" | ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "docker load"
fi

# ── 3. Deploy on server ──────────────────────────────────────────────────────
echo "==> Deploying on $DEPLOY_HOST"
ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" bash <<REMOTE
  set -euo pipefail
  cd "$DEPLOY_DIR"

  # If using a registry, update the image reference in the compose env
  export API_GATEWAY_IMAGE="${FULL_IMAGE}"

  # Restart only the gateway (zero-downtime: pull then recreate)
  docker compose -f "$COMPOSE_FILE" up -d --no-deps --pull=never api-gateway

  # Clean up old images
  docker image prune -f
REMOTE

echo "==> Deploy complete: $FULL_IMAGE → $DEPLOY_HOST"
