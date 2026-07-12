# ── Stage 1: builder ────────────────────────────────────────────────────────
# node:22-alpine = Linux Alpine (~5 MB) + Node 22 LTS; AS builder names this
# stage so we can copy selectively from it in the next stage.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests first so Docker can cache the npm ci layer separately
# from source changes — if only src/ changes, the cached node_modules is reused.
COPY package*.json ./

# Install ALL deps (including devDeps) so tsup is available for the build step.
RUN npm ci

# Copy build configs and source after deps to preserve layer caching.
COPY tsconfig.json tsup.config.ts ./
COPY src/ ./src/

# Compile TS → JS and resolve bare path aliases via esbuild.
# Outputs: dist/index.js, dist/scripts/migrate.js, dist/scripts/seed.js
RUN npm run build

# ── Stage 2: runner ─────────────────────────────────────────────────────────
# Fresh image — nothing from builder carries over automatically.
# Only what we explicitly COPY --from=builder lands here.
FROM node:22-alpine AS runner

WORKDIR /app

# Install production deps only; devDeps (tsup, typescript, jest…) are excluded.
COPY package*.json ./
RUN npm ci --omit=dev

# Pull compiled output from the builder stage.
COPY --from=builder /app/dist ./dist

# SQL migration files are read from disk at runtime by node-pg-migrate.
# The Container Apps Job runs: node dist/scripts/deploy-db.js (migrate + seed)
COPY migrations/ ./migrations/

EXPOSE 3000

# Exec form (JSON array) so SIGTERM reaches node directly — enables graceful shutdown.
CMD ["node", "dist/index.js"]
