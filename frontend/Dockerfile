# ── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Build-time variable: the API base URL is baked into the JS bundle by Vite.
# Pass it with: docker build --build-arg VITE_API_URL=https://api.example.dev
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy manifests first to cache the npm ci layer independently of source changes.
COPY package*.json ./

# Install all deps (vite, typescript, sass etc. are devDeps needed for the build).
RUN npm ci

COPY . .

# tsc -b + vite build; the oxc minifier drops console/debugger in production mode.
RUN npm run build

# ── Stage 2: runner ─────────────────────────────────────────────────────────
# No Node.js in the final image — nginx serves the compiled static files.
FROM nginx:alpine AS runner

# Replace the default nginx config with our SPA-aware one.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React app from the builder stage.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx starts in foreground by default in the official image — no CMD needed.
