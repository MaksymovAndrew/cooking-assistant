#!/usr/bin/env bash
# Full server report: resources, shared platform, and one section per project.
# Verdicts, not logs - "is everything alive and how much room is left".
#
# Installed at /srv/bin/status.sh, run as: sudo /srv/bin/status.sh
# The domains come from the proxy's own .env, so no real hostname lives in the repo.
set -uo pipefail

STACK_COOKING=/srv/cooking-assistant
NET_COOKING=cooking-assistant_default
EDGE_ENV=/srv/edge/.env

edge_env() { grep -oP "(?<=^$1=).*" "$EDGE_ENV" 2>/dev/null; }
APP_DOMAIN=$(edge_env APP_DOMAIN)
API_DOMAIN=$(edge_env API_DOMAIN)

G=$'\e[32m'; R=$'\e[31m'; Y=$'\e[33m'; B=$'\e[1m'; D=$'\e[2m'; O=$'\e[0m'

section() { printf '\n%s%s%s\n' "$B" "$1" "$O"; }
row()     { printf '  %-11s %-58s %s\n' "$1" "$2" "$3"; }
ok()      { printf '%sOK%s' "$G" "$O"; }
fail()    { printf '%sFAIL%s' "$R" "$O"; }
warn()    { printf '%sWARN%s' "$Y" "$O"; }

# --- data collected once, several commands are slow ---------------------------
STATS=$(docker stats --no-stream --format '{{.Name}}|{{.MemUsage}}|{{.CPUPerc}}' 2>/dev/null)
mem_of() { echo "$STATS" | awk -F'|' -v n="$1" '$1==n {print $2}' | sed 's/ \/ / of /'; }

# Echoes "<human readable state>|<1 healthy, 0 not>". Both values come back together because a
# command substitution runs in a subshell and cannot set variables in the caller.
container() {
    local name=$1 state health
    state=$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null) || { echo "not found|0"; return; }
    health=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}-{{end}}' "$name" 2>/dev/null)
    local flag=0
    [ "$state" = running ] && { [ "$health" = healthy ] || [ "$health" = "-" ]; } && flag=1
    if [ "$health" = "-" ]; then echo "$state|$flag"; else echo "$state, $health|$flag"; fi
}

http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$1" 2>/dev/null; }

cert_days() {
    local end
    end=$(echo | openssl s_client -connect 127.0.0.1:443 -servername "$1" 2>/dev/null \
          | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    [ -z "$end" ] && return 1
    echo $(( ( $(date -d "$end" +%s) - $(date +%s) ) / 86400 ))
}

# --- header -------------------------------------------------------------------
printf '\n%s%s%s  ·  up %s  ·  %s\n' \
    "$B" "$(hostname)" "$O" "$(uptime -p | sed 's/up //')" "$(date '+%Y-%m-%d %H:%M')"
printf '%s────────────────────────────────────────────────────────────────────────%s\n' "$D" "$O"

# --- resources ----------------------------------------------------------------
section "RESOURCES"

read -r l1 l5 l15 _ < /proc/loadavg
CORES=$(nproc)
LOAD_PCT=$(awk -v l="$l1" -v c="$CORES" 'BEGIN{printf "%.0f", l*100/c}')
row "CPU" "$CORES cores $(uname -m)  ·  load $l1 $l5 $l15  ·  ${LOAD_PCT}% of capacity" \
    "$( [ "$LOAD_PCT" -lt 80 ] && ok || warn )"

read -r MEM_TOTAL MEM_USED <<< "$(free -m | awk 'NR==2 {print $2, $3}')"
MEM_PCT=$(( MEM_USED * 100 / MEM_TOTAL ))
MEM_HUMAN=$(awk -v u="$MEM_USED" -v t="$MEM_TOTAL" 'BEGIN{printf "%.1f of %.1f GB", u/1024, t/1024}')
row "Memory" "$MEM_HUMAN (${MEM_PCT}%)  ·  ~3 GB held by idle guard" \
    "$( [ "$MEM_PCT" -lt 85 ] && ok || warn )"

read -r D_USED D_SIZE D_PCT <<< "$(df -h / | awk 'NR==2 {print $3, $2, $5}')"
row "Disk" "$D_USED of $D_SIZE used ($D_PCT)" "$( [ "${D_PCT%\%}" -lt 80 ] && ok || warn )"

PUB_IP=$(curl -s --max-time 8 https://api.ipify.org 2>/dev/null)
row "Network" "${PUB_IP:-unknown}" "$( [ -n "$PUB_IP" ] && ok || warn )"
row "OS" "$(lsb_release -ds)  ·  kernel $(uname -r)" ""

# --- shared platform ----------------------------------------------------------
section "PLATFORM"

row "Docker" "$(docker --version | sed 's/Docker version //; s/, build.*//')  ·  compose $(docker compose version --short)" "$(ok)"

PORTS=$(iptables -S INPUT 2>/dev/null | grep -oP '(?<=--dport )\d+' | sort -n | tr '\n' ' ')
row "Firewall" "open: ${PORTS}·  everything else rejected" \
    "$( [ "$(echo "$PORTS" | grep -c 443)" -gt 0 ] && ok || fail )"

IFS="|" read -r CADDY_STATE CADDY_OK <<< "$(container caddy)"
row "Proxy" "caddy $CADDY_STATE  ·  $(mem_of caddy)" "$( [ "$CADDY_OK" = 1 ] && ok || fail )"

for host in $APP_DOMAIN $API_DOMAIN; do
    if days=$(cert_days "$host"); then
        row "TLS" "$host  ·  auto-renew  ·  $days days left" \
            "$( [ "$days" -gt 20 ] && ok || warn )"
    else
        row "TLS" "$host  ·  no certificate" "$(fail)"
    fi
done

systemctl is-active --quiet idle-guard-memory && IDLE_OK=1 || IDLE_OK=0
row "Idle guard" "3 GB memory held  ·  CPU load daily at 04:30" "$( [ "$IDLE_OK" = 1 ] && ok || fail )"

LAST=$(ls -t /srv/backups/db/cooking-*.dump 2>/dev/null | head -1)
if [ -n "$LAST" ]; then
    AGE_H=$(( ( $(date +%s) - $(stat -c %Y "$LAST") ) / 3600 ))
    COUNT=$(ls -1 /srv/backups/db/*.dump 2>/dev/null | wc -l)
    row "Backups" "last ${AGE_H}h ago ($(du -h "$LAST" | cut -f1))  ·  $COUNT on disk  ·  daily 03:30, restore-verified" \
        "$( [ "$AGE_H" -lt 30 ] && ok || warn )"
else
    row "Backups" "no dumps on disk" "$(fail)"
fi

LAST_MEDIA=$(ls -t /srv/backups/media/uploads-*.tar 2>/dev/null | head -1)
if [ -n "$LAST_MEDIA" ]; then
    MEDIA_AGE_H=$(( ( $(date +%s) - $(stat -c %Y "$LAST_MEDIA") ) / 3600 ))
    row "Photo copy" "last ${MEDIA_AGE_H}h ago ($(du -h "$LAST_MEDIA" | cut -f1))  ·  archive checked against the volume" \
        "$( [ "$MEDIA_AGE_H" -lt 30 ] && ok || warn )"
else
    row "Photo copy" "no uploads archive on disk" "$(fail)"
fi

# --- project: cooking assistant ----------------------------------------------
section "COOKING ASSISTANT"

SITE_CODE=$(http_code "https://$APP_DOMAIN/")
row "Site" "https://$APP_DOMAIN  ·  HTTP $SITE_CODE" "$( [ "$SITE_CODE" = 200 ] && ok || fail )"

API_BODY=$(curl -s --max-time 10 "https://$API_DOMAIN/api/health" 2>/dev/null)
row "API" "https://$API_DOMAIN  ·  ${API_BODY:-no response}" \
    "$( [ "$API_BODY" = '{"status":"ok"}' ] && ok || fail )"

IFS="|" read -r FE_STATE FE_OK <<< "$(container cooking-assistant-frontend-1)"
row "Frontend" "Next.js on node $(docker exec cooking-assistant-frontend-1 node --version 2>/dev/null)  ·  $FE_STATE  ·  $(mem_of cooking-assistant-frontend-1)" \
    "$( [ "$FE_OK" = 1 ] && ok || fail )"

IFS="|" read -r BE_STATE BE_OK <<< "$(container cooking-assistant-backend-1)"
row "Backend" "node $(docker exec cooking-assistant-backend-1 node --version 2>/dev/null)  ·  $BE_STATE  ·  $(mem_of cooking-assistant-backend-1)" \
    "$( [ "$BE_OK" = 1 ] && ok || fail )"

IFS="|" read -r DB_STATE DB_OK <<< "$(container cooking-assistant-postgres-1)"
row "Database" "postgres 18  ·  $DB_STATE  ·  $(mem_of cooking-assistant-postgres-1)  ·  not exposed" \
    "$( [ "$DB_OK" = 1 ] && ok || fail )"

# the throwaway psql container gets the DB_* keys only, never the app's secrets
DB_ENV=$(mktemp)
trap 'rm -f "$DB_ENV"' EXIT
grep '^DB_' "$STACK_COOKING/.env" > "$DB_ENV" 2>/dev/null
COUNTS=$(docker run --rm --network "$NET_COOKING" --env-file "$DB_ENV" postgres:18-alpine \
    sh -c 'PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -At -F" " -c "select (select count(*) from person), (select count(*) from recipes), (select count(*) from menu), (select count(*) from ingredients)"' 2>/dev/null)
if [ -n "$COUNTS" ]; then
    set -- $COUNTS
    row "Content" "$1 users  ·  $2 recipes  ·  $3 menus  ·  $4 ingredients" "$(ok)"
else
    row "Content" "database did not answer" "$(fail)"
fi

PHOTOS=$(docker exec cooking-assistant-backend-1 sh -c 'ls /app/uploads | wc -l; du -sh /app/uploads | cut -f1' 2>/dev/null | tr '\n' ' ')
if [ -n "$PHOTOS" ]; then
    set -- $PHOTOS
    row "Photos" "$1 files  ·  $2 in the uploads volume" "$(ok)"
else
    row "Photos" "uploads volume not readable" "$(warn)"
fi

# --- future project sections go here -----------------------------------------
# section "LANDING"   - once /srv/landing exists
# section "BOT <name>" - once /srv/bot-<name> exists

echo
