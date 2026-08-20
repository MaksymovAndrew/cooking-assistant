#!/usr/bin/env bash
# Server-side deploy, invoked by CI over SSH. The deploy key is pinned to this script with a forced
# command, so the requested image tag arrives in SSH_ORIGINAL_COMMAND rather than as arguments.
#
# Installed at /srv/bin/deploy.sh
set -euo pipefail

STACK_DIR=/srv/cooking-assistant
ENV_FILE="$STACK_DIR/.env"
BACKEND_CONTAINER=cooking-assistant-backend-1
HEALTH_TIMEOUT_SECONDS=150
POLL_INTERVAL_SECONDS=5

log() { echo "[$(date '+%H:%M:%S')] $*"; }
die() { echo "[$(date '+%H:%M:%S')] ERROR: $*" >&2; exit 1; }

TAG="${SSH_ORIGINAL_COMMAND:-${1:-}}"
[ -n "$TAG" ] || die "no image tag supplied"
[[ "$TAG" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || die "refusing suspicious tag: $TAG"

cd "$STACK_DIR"

PREVIOUS_TAG=$(grep -oP '(?<=^IMAGE_TAG=).*' "$ENV_FILE" || true)
[ -n "$PREVIOUS_TAG" ] || die "IMAGE_TAG missing from $ENV_FILE"

set_tag() {
    sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=$1|" "$ENV_FILE"
}

backend_healthy() {
    [ "$(docker inspect -f '{{.State.Health.Status}}' "$BACKEND_CONTAINER" 2>/dev/null)" = healthy ]
}

roll_back() {
    log "rolling back to $PREVIOUS_TAG"
    set_tag "$PREVIOUS_TAG"
    docker compose up -d >/dev/null 2>&1 || true
    die "deploy failed, previous version restored"
}

log "deploying $TAG (current: $PREVIOUS_TAG)"
set_tag "$TAG"

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
