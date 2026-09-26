# ── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Build-time variables: Next inlines every NEXT_PUBLIC_* value into the client bundle and
# resolves canonical/social URLs against the site origin, so both are needed here, not at
# runtime. Changing either means rebuilding the image.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Copy manifests first to cache the npm ci layer independently of source changes.
COPY package*.json ./

# Install all deps (next, typescript, sass etc. are devDeps needed for the build).
RUN npm ci

COPY . .

# next build; `output: "standalone"` emits a self-contained server under .next/standalone.
RUN npm run build

# ── Stage 2: runner ─────────────────────────────────────────────────────────
# Node, not nginx: the app is server-rendered now, so there is a process to run.
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# standalone's server.js binds HOSTNAME:PORT; the default host is loopback, which the reverse
# proxy on the shared network cannot reach
ENV HOSTNAME=0.0.0.0
# not 80: the runtime drops to an unprivileged user, and ports below 1024 need root
ENV PORT=8080

# Owned by the runtime user, not root: the server writes its incremental and fetch caches
# under .next/ once pages start fetching data.
# The traced server bundle: server.js plus only the node_modules it actually reaches.
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Neither of these is part of the trace - standalone omits both, and forgetting them ships a
# site with no stylesheets and no icons.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

EXPOSE 8080

# Drop root: the server only reads its own bundle and logs to stdout.
USER node

# Exec form (JSON array) so SIGTERM reaches node directly — enables graceful shutdown.
CMD ["node", "server.js"]
