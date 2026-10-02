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
EDGE_ENV=/srv/edge/.env
REGISTRY=ghcr.io
BACKEND_CONTAINER=cooking-assistant-backend-1
FRONTEND_CONTAINER=cooking-assistant-frontend-1
HEALTH_TIMEOUT_SECONDS=150
POLL_INTERVAL_SECONDS=5
BACKUP_COPY_RETENTION_DAYS=14
PUBLIC_PROBE_ATTEMPTS=6

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

container_healthy() {
    [ "$(docker inspect -f '{{.State.Health.Status}}' "$1" 2>/dev/null)" = healthy ]
}

# the frontend is a server-rendering process now, not a static file server: it can start, answer
# nothing useful, and still look fine to anything that only watches the backend
stack_healthy() {
    container_healthy "$BACKEND_CONTAINER" && container_healthy "$FRONTEND_CONTAINER"
}

wait_for_healthy() {
    local deadline=$(( SECONDS + HEALTH_TIMEOUT_SECONDS ))
    until stack_healthy; do
        [ "$SECONDS" -lt "$deadline" ] || return 1
        sleep "$POLL_INTERVAL_SECONDS"
    done
}

roll_back() {
    log "rolling back to $PREVIOUS_BACKEND:$PREVIOUS_TAG"
    write_release "$PREVIOUS_BACKEND" "$PREVIOUS_FRONTEND" "$PREVIOUS_TAG"
    docker compose up -d >/dev/null 2>&1 || true
    wait_for_healthy || die "deploy failed, and the restored $PREVIOUS_TAG is NOT healthy either"
    die "deploy failed, previous version $PREVIOUS_TAG restored and healthy"
}

# through Caddy, as a visitor gets there: container health checks run inside the project network,
# so a proxy pointing at the wrong port would otherwise pass as a green deploy
public_ok() {
    local url=$1 host=${1#https://}
    host=${host%%/*}
    curl -fsS -o /dev/null --max-time 10 --resolve "$host:443:127.0.0.1" "$url"
}

probe_public() {
    local app api attempt
    app=$(grep -oP '(?<=^APP_DOMAIN=).*' "$EDGE_ENV" 2>/dev/null || true)
    api=$(grep -oP '(?<=^API_DOMAIN=).*' "$EDGE_ENV" 2>/dev/null || true)
    if [ -z "$app" ] || [ -z "$api" ]; then
        log "no domains in $EDGE_ENV - public probe skipped"
        return 0
    fi
    for attempt in $(seq "$PUBLIC_PROBE_ATTEMPTS"); do
        public_ok "https://$api/api/health" && public_ok "https://$app/" && return 0
        log "public probe $attempt/$PUBLIC_PROBE_ATTEMPTS failed, retrying"
        sleep "$POLL_INTERVAL_SECONDS"
    done
    return 1
}

# this project's images only, minus the running tag and the rollback target; other projects on the
# box keep their own history, so a blanket `docker image prune -a` is off the table
stale_images() {
    docker image ls --format '{{.Repository}} {{.Tag}}' \
        | awk -v current="$TAG" -v previous="$PREVIOUS_TAG" \
            '$1 ~ /\/cooking-(backend|frontend)$/ && $2 != current && $2 != previous && $2 != "<none>" { print $1 ":" $2 }'
}

clean_up() {
    stale_images | xargs -r docker image rm >/dev/null 2>&1 || true
    docker image prune -f --filter 'until=168h' >/dev/null 2>&1 || true
    # the copies made by hand before replacing a server file
    find /srv/bin "$STACK_DIR" -maxdepth 1 -name '*.bak-*' -mtime +"$BACKUP_COPY_RETENTION_DAYS" \
        -delete 2>/dev/null || true
}

log "deploying $OWNER/$TAG (current: $PREVIOUS_TAG)"
write_release "$REGISTRY/$OWNER/cooking-backend" "$REGISTRY/$OWNER/cooking-frontend" "$TAG"

log "pulling images"
docker compose pull --quiet || roll_back

log "running migrations"
docker compose --profile tools run --rm migrate || roll_back

log "starting containers"
docker compose up -d || roll_back

log "waiting for both containers to report healthy"
if ! wait_for_healthy; then
    docker compose logs --tail 40 backend frontend || true
    roll_back
fi

log "probing the site and the API through the proxy"
probe_public || roll_back

log "deployed $TAG successfully"
clean_up
log "cleaned up: kept images $TAG and $PREVIOUS_TAG, dropped stale .bak copies"
