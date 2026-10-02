#!/usr/bin/env bash
# Nightly database backup with retention and a real restore check.
# A dump that was never restored is not a backup.
#
# Installed at /srv/bin/backup.sh, run nightly at 03:30.
set -euo pipefail

STACK=/srv/cooking-assistant
OUT=/srv/backups/db
NETWORK=cooking-assistant_default
IMAGE=postgres:18-alpine
STAMP=$(date +%Y%m%d-%H%M)
KEEP_DAILY_DAYS=14
KEEP_WEEKLY_DAYS=60

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# the throwaway psql containers get the DB_* keys only, never the app's secrets
DB_ENV=$(mktemp)
trap 'rm -f "$DB_ENV"' EXIT
grep '^DB_' "$STACK/.env" > "$DB_ENV"

mkdir -p "$OUT"

log "dumping database"
docker run --rm --network "$NETWORK" --env-file "$DB_ENV" -v "$OUT:/out" -e STAMP="$STAMP" "$IMAGE" \
    sh -c 'PGPASSWORD=$DB_PASSWORD pg_dump -Fc --no-owner --no-privileges -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f /out/cooking-$STAMP.dump'

DUMP="$OUT/cooking-$STAMP.dump"
log "dump written: $(du -h "$DUMP" | cut -f1)"

log "verifying by restoring into a throwaway database"
docker run --rm --network "$NETWORK" --env-file "$DB_ENV" -v "$OUT:/out" -e STAMP="$STAMP" "$IMAGE" sh -c '
    set -e
    export PGPASSWORD=$DB_PASSWORD
    psql -h "$DB_HOST" -U "$DB_USER" -d postgres -q -c "drop database if exists verify_restore"
    psql -h "$DB_HOST" -U "$DB_USER" -d postgres -q -c "create database verify_restore"
    pg_restore --no-owner --no-privileges -h "$DB_HOST" -U "$DB_USER" -d verify_restore /out/cooking-$STAMP.dump
    COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d verify_restore -At -c "select count(*) from recipes")
    psql -h "$DB_HOST" -U "$DB_USER" -d postgres -q -c "drop database verify_restore"
    [ "$COUNT" -gt 0 ] || { echo "restore check failed: recipes table is empty"; exit 1; }
    echo "restore check passed: $COUNT recipes"
'

log "pruning old dumps"
# Sunday dumps are kept much longer, so a bad week is still recoverable from.
find "$OUT" -name 'cooking-*.dump' -mtime +$KEEP_DAILY_DAYS -printf '%p %TA\n' \
    | awk '$2 != "Sunday" {print $1}' | xargs -r rm -f
find "$OUT" -name 'cooking-*.dump' -mtime +$KEEP_WEEKLY_DAYS -delete

# Uploaded photos live in their own volume, outside the database dump. The files are
# already-compressed WebP/JPEG, so the archive is a plain tar.
UPLOADS_VOLUME=cooking-assistant_uploads
MEDIA_OUT=/srv/backups/media

if docker volume inspect "$UPLOADS_VOLUME" >/dev/null 2>&1; then
    mkdir -p "$MEDIA_OUT"
    ARCHIVE="$MEDIA_OUT/uploads-$STAMP.tar"

    log "archiving uploaded photos"
    docker run --rm -v "$UPLOADS_VOLUME:/uploads:ro" -v "$MEDIA_OUT:/out" -e STAMP="$STAMP" "$IMAGE" \
        sh -c 'tar -cf /out/uploads-$STAMP.tar -C /uploads .'

    log "verifying the archive against the volume"
    docker run --rm -v "$UPLOADS_VOLUME:/uploads:ro" -v "$MEDIA_OUT:/out" -e STAMP="$STAMP" "$IMAGE" sh -c '
        set -e
        IN_VOLUME=$(find /uploads -type f | wc -l)
        IN_ARCHIVE=$(tar -tf /out/uploads-$STAMP.tar | grep -vc "/$" || true)
        [ "$IN_VOLUME" -eq "$IN_ARCHIVE" ] || { echo "archive check failed: $IN_ARCHIVE of $IN_VOLUME files"; exit 1; }
        echo "archive check passed: $IN_ARCHIVE files"
    '
    log "archive written: $(du -h "$ARCHIVE" | cut -f1)"

    find "$MEDIA_OUT" -name 'uploads-*.tar' -mtime +$KEEP_DAILY_DAYS -printf '%p %TA\n' \
        | awk '$2 != "Sunday" {print $1}' | xargs -r rm -f
    find "$MEDIA_OUT" -name 'uploads-*.tar' -mtime +$KEEP_WEEKLY_DAYS -delete
else
    log "no uploads volume yet - photo archive skipped"
fi

log "done - $(ls -1 "$OUT"/cooking-*.dump | wc -l) dumps on disk"
