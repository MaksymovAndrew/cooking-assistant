#!/usr/bin/env bash
# Server-side deploy, invoked by CI over SSH. The deploy key is pinned to this script with a forced
# command, so the request arrives in SSH_ORIGINAL_COMMAND as "<owner> <tag>".
#
# The owner comes from the workflow rather than from .env on purpose: only GitHub knows who owns the
# repository right now, and a transfer silently changes the GHCR namespace. Hardcoding it server-side
# has already broken a release once.
#
# Installed at /srv/bin/deploy.sh
set -euo pipefail

STACK_DIR=/srv/cooking-assistant
ENV_FILE="$STACK_DIR/.env"
REGISTRY=ghcr.io
BACKEND_CONTAINER=cooking-assistant-backend-1
HEALTH_TIMEOUT_SECONDS=150
POLL_INTERVAL_SECONDS=5

log() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; exit 1; }

read -r OWNER TAG _ <<< "${SSH_ORIGINAL_COMMAND:-${*:-}}"
[ -n "${OWNER:-}" ] && [ -n "${TAG:-}" ] || die "expected \"<owner> <tag>\", got: ${SSH_ORIGINAL_COMMAND:-nothing}"
[[ "$OWNER" =~ ^[a-z0-9][a-z0-9-]*$ ]] || die "refusing suspicious owner: $OWNER"
[[ "$TAG" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || die "refusing suspicious tag: $TAG"

cd "$STACK_DIR"

read_env() { grep -oP "(?<=^$1=).*" "$ENV_FILE" || true; }

PREVIOUS_BACKEND=$(read_env BACKEND_IMAGE)
PREVIOUS_FRONTEND=$(read_env FRONTEND_IMAGE)
PREVIOUS_TAG=$(read_env IMAGE_TAG)
[ -n "$PREVIOUS_TAG" ] || die "IMAGE_TAG missing from $ENV_FILE"

write_release() {
    local backend=$1 frontend=$2 tag=$3
    sed -i \
        -e "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=$backend|" \
        -e "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=$frontend|" \
        -e "s|^IMAGE_TAG=.*|IMAGE_TAG=$tag|" \
        "$ENV_FILE"
}

backend_healthy() {
    [ "$(docker inspect -f '{{.State.Health.Status}}' "$BACKEND_CONTAINER" 2>/dev/null)" = healthy ]
}

roll_back() {
    log "rolling back to $PREVIOUS_BACKEND:$PREVIOUS_TAG"
    write_release "$PREVIOUS_BACKEND" "$PREVIOUS_FRONTEND" "$PREVIOUS_TAG"
    docker compose up -d >/dev/null 2>&1 || true
    die "deploy failed, previous version restored"
}

log "deploying $OWNER/$TAG (current: $PREVIOUS_TAG)"
write_release "$REGISTRY/$OWNER/cooking-backend" "$REGISTRY/$OWNER/cooking-frontend" "$TAG"

log "pulling images"
docker compose pull --quiet || roll_back

log "running migrations"
docker compose --profile tools run --rm migrate || roll_back

log "starting containers"
docker compose up -d || roll_back

log "waiting for the backend to report healthy"
deadline=$(( SECONDS + HEALTH_TIMEOUT_SECONDS ))
until backend_healthy; do
    if [ "$SECONDS" -ge "$deadline" ]; then
        docker compose logs --tail 40 backend || true
        roll_back
    fi
    sleep "$POLL_INTERVAL_SECONDS"
done

log "deployed $TAG successfully"
docker image prune -f --filter 'until=168h' >/dev/null 2>&1 || true
