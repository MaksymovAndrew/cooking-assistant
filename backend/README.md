# Cooking Assistant - Backend

Express + PostgreSQL API for the [Cooking Assistant](../README.md) platform. Listens on port 3000 and
serves the [frontend](../frontend/README.md) at http://localhost:8080 (CORS-restricted).

## Tech stack

- Node.js + TypeScript + Express 5 - HTTP server
- PostgreSQL via `pg` (connection pool, raw SQL, no ORM)
- jsonwebtoken + bcryptjs - auth (httpOnly cookie session) and password hashing
- cookie-parser - reads the auth cookie on every request
- helmet + express-rate-limit - security headers and brute-force guard on auth
- pino + pino-http - structured app and request logging
- zod - request and environment validation
- node-pg-migrate - versioned SQL schema migrations
- tsx - TypeScript runtime and dev auto-reload

## Running locally

Prefer the root of the monorepo: `npm install && npm start` boots backend + frontend together. Use the
commands below only to work on the backend alone.

```bash
npm install
npm run dev      # tsx watch -> http://localhost:3000 (auto-reload)
npm start        # tsx, no auto-reload
npm run typecheck
```

## Production (Docker)

In production the backend is compiled by `tsup` into `dist/` and run with plain `node` (no tsx, no
TypeScript toolchain). The [Dockerfile](Dockerfile) handles this in two stages:

1. **builder** - installs all deps (including devDeps for tsup), runs `npm run build`, produces `dist/index.js`,
   `dist/scripts/migrate.js`, `dist/scripts/seed.js`, `dist/scripts/deploy-db.js`.
2. **runner** - installs prod-only deps (`npm ci --omit=dev`), copies `dist/` and `migrations/`, runs
   `node dist/index.js`.

Migrations and seed run before the new image goes live, via an Azure Container Apps Job that runs:

```bash
node dist/scripts/deploy-db.js
```

`deploy-db.js` is a single entry point that runs migrations then seed in one Node process (no shell needed).

All secrets (`JWT_SECRET_KEY`, `DB_*`, `CORS_ORIGIN`, etc.) are set as Container App environment variables -
never baked into the image. See [Required configuration](#configuration) for the full list.

## Configuration

### 1. backend/.env

This file is gitignored and not in the repo. Copy the template and fill in real values:

```bash
cp .env.example .env     # PowerShell: Copy-Item .env.example .env
```

[.env.example](.env.example) ships with working local defaults; here is what each key is (fill in your own
values rather than copying any shown here):

```
JWT_SECRET_KEY=<random string, at least 32 characters>
DB_USER=<your postgres user>
DB_PASSWORD=<your postgres password>
DB_HOST=<db host>
DB_PORT=<db port>
DB_NAME=<your database name>
DB_SSL=<true | false; defaults to on in production, off otherwise>
DB_SSL_REJECT_UNAUTHORIZED=<set false for managed Postgres with a private/self-signed CA>
NODE_ENV=<development | production>
PORT=<backend port>
LOG_LEVEL=<pino log level, e.g. info>
TRUST_PROXY_HOPS=<trusted reverse-proxy hops for req.ip; default 1 in production, 0 otherwise>
RATE_LIMIT_MAX=<global per-client request cap per window; default 300>
RATE_LIMIT_WINDOW_MS=<global rate-limit window in ms; default 60000>
CORS_ORIGIN=<allowed frontend origin>
COOKIE_DOMAIN=<empty in dev; shared parent domain in production>
RESEND_API_KEY=<Resend API key; leave empty to use the logging fallback>
EMAIL_FROM=<e.g. noreply@example.com; leave empty to use the logging fallback>
```

`NODE_ENV=production` turns on the `Secure` flag of the auth cookie. `COOKIE_DOMAIN` is left empty in dev
(a host-only cookie); in production set the shared parent domain (e.g. `.example.com`) so `app.*` and
`api.*` subdomains share the session cookie. See [src/config/cookie.ts](src/config/cookie.ts).

`JWT_SECRET_KEY` is used by [src/middleware/jwtMiddleware.ts](src/middleware/jwtMiddleware.ts) (verifies
tokens) and [src/infrastructure/security/JwtTokenService.ts](src/infrastructure/security/JwtTokenService.ts)
(signs them at login). It must be at least 32 characters (validated on startup). Without it, login and
every protected route return a 500 configuration error.
The rest of the env is validated with zod on startup; invalid ports or logger levels fail fast with a
clear configuration error. `LOG_LEVEL` controls the pino logger level and defaults to `info` when unset.

`RESEND_API_KEY` and `EMAIL_FROM` configure transactional email (password reset and email verification
links). Leave both empty for local dev/CI: the composition root picks `LoggingEmailService`, which logs
the link instead of sending it, so the flows work end to end without a real Resend account. If either is
set, both must be set - the app fails fast on startup otherwise
([src/config/env.ts](src/config/env.ts)'s `assertConsistentEmailConfig`). With both set,
`ResendEmailService` calls Resend's REST API via native `fetch`.

When you add a new env key, add it (without a value) to [.env.example](.env.example) too.

### 2. PostgreSQL connection - [src/config/env.ts](src/config/env.ts) and [src/db.ts](src/db.ts)

Credentials are read from the `DB_*` variables above. Each one falls back to a conventional local-Postgres
default when unset (the exact fallbacks live in [src/config/env.ts](src/config/env.ts)). Set the `DB_*`
keys in `.env` to match your own Postgres - no need to edit [src/db.ts](src/db.ts).

### 3. Database - [migrations/](migrations/) + [src/scripts/seed.ts](src/scripts/seed.ts)

The schema is owned by `node-pg-migrate`. The migrate/seed scripts reuse the app's own DB config
([src/config/env.ts](src/config/env.ts) → the `DB_*` env vars), so there is no separate `DATABASE_URL` to keep
in sync. `node-pg-migrate` creates the **tables inside** a database - it does not create the database itself, so
the database has to exist first.

Pick the path that matches your situation:

#### A. Fresh / empty database (new machine, prod, a teammate cloning the repo)

1. Create an empty database whose name matches your `DB_NAME`. Any one of these (substitute your own
   `DB_USER` / `DB_NAME`):
    - **pgAdmin**: right-click _Databases_ → _Create_ → _Database_ → give it your `DB_NAME`.
    - **psql**: `psql -U <DB_USER> -c "CREATE DATABASE <DB_NAME>;"`
    - **createdb** (only works if the Postgres `bin/` folder is on your PATH, otherwise use the full path to it):
      `createdb -U <DB_USER> <DB_NAME>`
2. `npm run migrate` - builds every table from the files in [migrations/](migrations/).
3. `npm run seed` - loads reference + sample data (units, recipe types, menu categories, sample ingredients).

#### B. A database that already has the schema (the original `database.sql` setup, from before migrations)

Do **not** run a plain `npm run migrate` - it would fail because the tables already exist. Adopt the migrations
once, without touching any data:

```bash
npm run migrate -- up --fake
```

This records the initial migration as "already applied" (it writes one row to the `pgmigrations` tracking
table) but runs no SQL, so existing rows are untouched. After this one-time step the database is in sync with
the migrations and you treat it like any other. (The `--` is needed only because `--fake` is a flag; bare words
such as `down` are forwarded without it.)

#### Day to day: which change goes where

Structure and data are different things - this is the part people trip on:

| What you are doing                                                         | Where it goes                                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A user creates a recipe / adds a pantry ingredient through the running app | Nowhere - it is runtime data via the normal API. No migration, no seed. |
| A new **starter ingredient** that every fresh DB should ship with          | A row in `seed.ts`, then `npm run seed`                                 |
| A new table / column / constraint / index (the **shape** of the DB)        | A new migration                                                         |

**Add a starter ingredient (e.g. a 23rd):** add one row to the ingredients `VALUES` list in
[src/scripts/seed.ts](src/scripts/seed.ts) - the columns are `(name, unit, allergens, days_to_expire,
seasonality, storage_condition)` - then `npm run seed`. Seed is idempotent (`ON CONFLICT (name) DO NOTHING`), so
on an existing DB it inserts only the new row and leaves the rest alone. Commit `seed.ts`. Do **not** write a
migration - ingredients are rows, not schema.

**Make a schema change (the only time you write a migration):**

1. `npm run migrate:create add-calories-to-ingredients` - scaffolds
   `migrations/<timestamp>_add-calories-to-ingredients.sql` with empty `-- Up Migration` / `-- Down Migration`
   sections.
2. Fill `Up` with the change and `Down` with the exact reverse:
    ```sql
    -- Up Migration
    ALTER TABLE ingredients ADD COLUMN calories INTEGER;

    -- Down Migration
    ALTER TABLE ingredients DROP COLUMN calories;
    ```
3. `npm run migrate` - applies only the new file (the `pgmigrations` table tracks what already ran, so old
   migrations are skipped). `npm run migrate down` rolls the last one back via its `Down` section.
4. Update the code that uses the new shape (the relevant `Pg*Repository` SQL and types, plus a zod schema if it
   is request input), and commit the migration file together with that code.

The number prefixing a migration file is a timestamp that only sets apply order (later = runs later). Never
rename, edit, or reorder a migration that has already been applied anywhere - add a new migration instead.

#### Commands

| Command                         | Does                                                                   |
| ------------------------------- | ---------------------------------------------------------------------- |
| `npm run migrate`               | apply all pending migrations (up)                                      |
| `npm run migrate down`          | roll back the last migration                                           |
| `npm run migrate:create <name>` | scaffold a new migration file                                          |
| `npm run migrate -- up --fake`  | mark migrations as applied without running them (adopt an existing DB) |
| `npm run seed`                  | load / top up reference + sample data (idempotent)                     |

All commands work from the repo root or from `backend/`. The legacy `database.sql` has been removed - the
migrations are the single source of truth for the schema (its old content is in git history if ever needed).

### 4. CORS - [src/app.ts](src/app.ts)

The allowed origin comes from the `CORS_ORIGIN` env var (default `http://localhost:8080`). Set it to the
frontend's URL for non-local deploys; no code change needed. CORS runs with `credentials: true` and the app
mounts `cookie-parser`, so the browser can send the httpOnly auth cookie cross-origin (see
[Auth flow](#auth-flow)).

## Structure

```
backend/
├── package.json          scripts and backend package metadata
├── tsconfig.json         TypeScript config and path aliases
├── jest.config.js        Jest + ts-jest config
├── eslint.config.js      regular ESLint config
├── eslint.sonarjs.config.js
├── migrations/           node-pg-migrate SQL migrations (the source of truth for the schema)
├── .env.example          env template (tracked) - copy to .env
├── .env                  JWT_SECRET_KEY + DB_* + PORT (you create - gitignored)
│
└── src/
    ├── scripts/             migrate.ts, seed.ts (thin CLI entry points); runMigrations.ts, runSeed.ts (shared logic); deploy-db.ts (migrate + seed in one process, used by the Container Apps Job)
    ├── app.ts                createApp(controllers); mounts middleware, health, and routers without listening
    ├── index.ts              runtime entry; listens on 3000 and shuts down server + pg pool cleanly
    ├── composition-root.ts   dependency injection: buildControllers(deps), plus real pg wiring
    ├── composition-root.recipe.ts / .user.ts   companion files for the two largest controllers
    ├── db.ts                 pg.Pool connection (reads DB_* env via config/env.ts)
    ├── config/env.ts         typed env loading and JWT secret guard (isProduction, cookieDomain, corsOrigin)
    ├── config/logger.ts      shared pino logger, LOG_LEVEL-aware and silent in tests
    ├── config/cookie.ts      AUTH_COOKIE_NAME + AUTH_COOKIE_OPTIONS (httpOnly, sameSite, secure, maxAge)
    ├── config/security.ts    rate-limit configs, purpose-token TTLs, SESSION_TOKEN_TYPE, DUMMY_PASSWORD_HASH
    ├── constants/             errorMessages.ts (ERROR_CODES/ERROR_MESSAGES), pagination.ts, avatarKeys.ts
    ├── i18n/locales/en/       transactional-email copy (email.json), read by ResendEmailService
    │
    ├── domain/               innermost layer (no framework/db deps)
    │   ├── entities/         Recipe, Menu (only entities that enforce an invariant)
    │   ├── errors/           AppError + NotFoundError / ValidationError / UnauthorizedError (carry HTTP status)
    │   └── repositories/     repository interfaces (TypeScript interface)
    │
    ├── application/
    │   ├── ports/            service interfaces: PasswordHasher, TokenService, EmailSender
    │   ├── validation/       zod request schemas (*.schemas.ts), the validate() helper, assertRecipesExist
    │   └── use-cases/        one class per operation (recipes/, recipe-types/, menus/, menu-categories/, pantry/, users/)
    │
    ├── infrastructure/
    │   ├── persistence/pg/   concrete pg repositories - ALL SQL lives here
    │   ├── security/         BcryptPasswordHasher, JwtTokenService
    │   └── email/             ResendEmailService, LoggingEmailService (dev/CI fallback), createEmailSender factory
    │
    ├── middleware/
    │   ├── jwtMiddleware.ts  authenticateToken - verifies the JWT from the authToken cookie, attaches req.user
    │   ├── rateLimit.ts      createGlobalLimiter + per-route limiters: login/register (each with a
    │   │                     stricter per-login limiter and a looser per-IP one), forgotPassword,
    │   │                     resetPassword, changePassword, resendVerification, confirmEmail, deleteAccount
    │   └── errorHandler.ts   turns thrown errors into { error, code? } responses (mounted last)
    │
    ├── routes/               route factories (controller) => router, all under /api
    │   └── *.routes.ts
    │
    ├── controller/           thin HTTP adapters (DI classes) that call use cases
    │   ├── *.controller.ts
    │   └── requestUser.ts    getUserId(req) helper - returns req.user.id (never body/params)
    │
    ├── types/                ambient .d.ts files (express.d.ts req.user, env.d.ts)
    └── test/                 Jest setup, fake deps/test app helpers, and HTTP integration tests
```

## Architecture - clean (layered)

Dependencies point inward (Dependency Rule). The real graph is built in
[src/composition-root.ts](src/composition-root.ts) (split into `.recipe.ts` and `.user.ts` companions for
the two largest controllers) and consumed by [src/index.ts](src/index.ts). Tests can reuse
`buildControllers(deps)` with fakes and pass the result to [src/app.ts](src/app.ts). The app factory mounts
`helmet`, pino request logging, CORS (with credentials), `cookie-parser`, the 100kb JSON body parser, the
public health check, a global rate limiter, then the seven domain routers, and finally the error handler.

- **routes/** - factory functions `(controller) => router`; map `METHOD /path` directly to a
  controller handler, guard with `authenticateToken` (the public routes are `/health`, `/register`,
  `/login`, `/logout`, `/forgot-password`, `/reset-password`, and `/confirm-email`).
- **controller/** - thin classes; a handler reads `req`, calls a use case, sends the response. No try/catch.
- **application/validation/** - zod request schemas and the shared `validate()` helper. Schemas describe
  request shape only (types, required scalars, formats, ranges, array item shape).
- **application/use-cases/** - one class per operation with `execute(...)`: input validation + orchestration;
  throw domain errors; depend on repository/service interfaces only. Service ports in **application/ports/**.
- **domain/** - repository interfaces, entities, and `errors/AppError.ts` (errors carry an HTTP `status`).
  Entities such as `Recipe` and `Menu` keep domain invariants like non-empty ingredient/recipe lists, so
  each validation rule lives in one layer only.
- **infrastructure/persistence/pg/** - concrete repositories; ALL SQL; constructor takes the `pg.Pool`.
  **infrastructure/security/** - bcryptjs + jwt adapters.

Search/filter SQL is built by a shared [`SqlFilterBuilder`](src/infrastructure/persistence/pg/sqlFilterBuilder.ts)
rather than by hand. Each filter is one entry in a clause registry (`recipeFilterClauses.ts`,
`menuFilterClauses.ts`) declaring when it applies and what SQL it contributes; the builder hands out
`$n` placeholders through a `bind()` callback, so parameter indices can never drift out of sync with the
values array (the old hand-rolled `paramIndex` counter had exactly that bug). `escapeLikePattern()`
escapes `\`, `%`, and `_` before any `ILIKE` interpolation so literal wildcards in user input stay
literal. Adding a filter means one clause entry plus one zod field - no changes to the query assembly.

Errors: a use case throws a domain error -> Express 5 forwards the rejected promise -> `errorHandler`
logs through pino and replies `{ error: <msg> }` with `err.status || 500`. Every error body uses
`{ error }`, including auth failures and the JSON 404 for unknown routes. Transactions live inside a
single repository method (see menu/pantry repos).

To add a feature: add SQL to a `Pg*Repository` (and its interface), add a use case, call it from a
controller handler, and wire the new pieces in [src/composition-root.ts](src/composition-root.ts).

## Tests

Run `npm test` or `npm run test:coverage` from this folder. Unit tests are co-located in `__tests__/`:
use cases/entities use fake repositories, and middleware tests call `req`/`res`/`next` directly. HTTP
integration tests live in [src/test/integration/](src/test/integration/) and use supertest with
`buildTestApp`. Pg repositories are covered by a separate real-Postgres suite in
[src/test/db-integration/](src/test/db-integration/), run with `npm run test:db` - it has its own
`jest.db.config.js` and a `globalSetup`/`globalTeardown` pair that starts one shared Testcontainers
Postgres and applies the migrations. It needs Docker, so it is kept out of `npm test` and the pre-commit
hook and runs as its own CI job instead. Do not add mock-pool SQL-string tests as a substitute for it.

## Auth flow

Auth is an **httpOnly cookie** (`authToken`) - the token is never in a response body and the client never
reads it. Cookie name and options live in [src/config/cookie.ts](src/config/cookie.ts).

1. `POST /api/login` verifies the password via `BcryptPasswordHasher` and signs an HS256 JWT (payload
   `{ id }`, `expiresIn: "24h"`) via `JwtTokenService`. The controller sets it with
   `res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)` (`httpOnly`, `sameSite: "lax"`, `secure` in
   production, `domain` from `COOKIE_DOMAIN`, `maxAge` 24h) and responds `{ message: "Logged in" }`.
2. The browser sends the cookie automatically on later requests (`cookie-parser` + CORS `credentials: true`).
3. [src/middleware/jwtMiddleware.ts](src/middleware/jwtMiddleware.ts) reads the JWT from
   `req.cookies[AUTH_COOKIE_NAME]`, verifies it with `JWT_SECRET_KEY` (HS256 only) - `401` if the cookie is
   missing, `403` if it is invalid/expired - then attaches `req.user = { id }` and calls `next()`.
4. `GET /api/me` (protected) returns `{ id, ..., email, email_verified_at }` so the client can check its
   session and email-verification state. `POST /api/logout` (public) clears the cookie and returns
   `{ message: "Logged out" }`.
5. The current user's id always comes from `req.user.id` via the `getUserId(req)` helper
   ([src/controller/requestUser.ts](src/controller/requestUser.ts)), never from the request body/params.
6. `/register` requires an `email` (trimmed, lowercased, format-validated by `emailSchema()` in
   [src/application/validation/user.schemas.ts](src/application/validation/user.schemas.ts)) alongside
   `name`, `surname`, `login`, `password` - unique alongside `login`, so a duplicate `login` and a
   duplicate `email` fail with distinct `409` error codes (`auth/login_already_taken` vs
   `auth/email_already_taken`).
7. `/register`, `/login`, `/forgot-password`, `/change-password`, and `/resend-verification-email` each
   have their own rate limiter (5 requests / 1 min, `429` on excess), every endpoint with its own counter
   so testing one never blocks another - see
   [src/middleware/rateLimit.ts](src/middleware/rateLimit.ts)/[src/config/security.ts](src/config/security.ts).
   Two limiter shapes are used, depending on whether a successful (2xx) response is itself something worth
   capping:
    - `AUTH_RATE_LIMIT` (login, register, change-password) sets `skipSuccessfulRequests: true` - a
      successful request never counts against its own quota, only failed attempts do, since the 2xx here
      means the legitimate owner got in.
    - `EMAIL_SEND_RATE_LIMIT` (forgot-password, resend-verification-email) counts every request, success
      included - both endpoints always respond `200` by design (anti-enumeration / already-verified no-op),
      so a 2xx there is exactly the outcome that needs capping, not one to exempt.

    Login/register additionally key on the request's `login` field via `authLimiterKey`
    (`bodyFieldLimiterKey`), with a second, coarser `AUTH_IP_RATE_LIMIT` limiter (`loginIpLimiter`/
    `registerIpLimiter`, 20/min, keyed purely by IP via `ipLimiterKey`) layered underneath it - so spraying
    attempts across many distinct accounts from one address is still capped even though each account gets
    its own 5/min bucket. Forgot-password keys on `email`; change-password/resend-verification key on the
    authenticated `req.user.id` (a stolen session cookie, not a shared network, is the threat there) - see
    `userIdLimiterKey` in the same file. Login returns the same generic error for unknown user vs wrong
    password (anti-enumeration). pino redacts the `cookie` and `authorization` headers from logs.

8. Every domain error can carry a stable machine-readable `code` alongside its message (see
   `ERROR_CODES`/`ERROR_MESSAGES` in [src/constants/errorMessages.ts](src/constants/errorMessages.ts)) -
   `errorHandler` includes it in the JSON body (`{ error, code }`) for 4xx responses only, so the frontend
   can show the exact right copy per cause instead of guessing from the HTTP status.

### Purpose-scoped tokens (password reset / email verification)

Password reset and email verification links reuse the session JWT's signing mechanism through
`TokenService.generatePurposeToken`/`verifyPurposeToken`
([src/infrastructure/security/JwtTokenService.ts](src/infrastructure/security/JwtTokenService.ts)), with a
`purpose` claim (`"password-reset"` | `"verify-email"`) so a reset/verify link can never be replayed as a
session cookie, or vice versa, even though both are HS256 JWTs signed with the same secret.
`PASSWORD_RESET_TOKEN_TTL_SECONDS` (30 min) and `EMAIL_VERIFICATION_TOKEN_TTL_SECONDS` (24h) live in
[src/config/security.ts](src/config/security.ts).

Password-reset tokens are additionally bound to a fingerprint of the account's current password hash at
issue time (`generatePurposeToken`'s optional `bindingSource` argument): `ConfirmPasswordReset` re-checks
the fingerprint against the _current_ hash before accepting the token, so the link stops verifying the
moment it is used once (or the password changes any other way) instead of staying replayable for its
whole TTL. Email-verification tokens don't need this - replaying one just re-marks the same already-owned
email as verified, which is harmless.

### Password reset

- `POST /api/forgot-password` (public, rate-limited by email) looks the account up by email and only
  sends a reset link if it exists **and** its email is verified - both "no such email" and "email exists
  but unverified" are silent no-ops. The response is always the identical generic
  `{ message: "..." }` regardless, so the endpoint can't be used to check which emails are registered or
  verified (anti-enumeration).
- `POST /api/reset-password` (public) takes `{ token, newPassword }`, verifies the purpose + password-hash
  binding, and calls `updatePassword`. An invalid, expired, or already-used token returns `401` with code
  `auth/invalid_or_expired_token`. `newPassword` is also compared against the account's current password
  hash (`PasswordHasher.compare`) - a match returns `400` with code `auth/new_password_same_as_current`
  instead of silently no-op'ing the reset.

### Change password

- `POST /api/change-password` (`authenticateToken` + `changePasswordLimiter`, keyed by `req.user.id`)
  takes `{ currentPassword, newPassword }`, compares the current password via `BcryptPasswordHasher`, and
  hashes + saves the new one. A wrong current password returns `401` with code
  `auth/current_password_incorrect` - this is a normal in-band form error, not a signal that the session
  itself is invalid, so the frontend's global 401/403 interceptor explicitly excludes this endpoint from
  its "session expired, redirect to /login" behavior. `newPassword` is also compared against the current
  password hash - a match returns `400` with code `auth/new_password_same_as_current`, so a "change" can't
  silently be a no-op.

### Email verification

Every account always has an email (required and unique at registration - see point 6 above); there is no
"add/change email" capability, so verification is the only email-related self-service action.

- `POST /api/resend-verification-email` (auth'd, rate-limited by `req.user.id`) re-sends the link for the
  email already on file; no-ops with code `auth/email_already_verified` if it's already verified.
- `POST /api/confirm-email` (public) takes `{ token }`, verifies the `verify-email` purpose token, and
  calls `markEmailVerified`.

## API reference

All endpoints under `/api`. Public routes: `/health`, `/register`, `/login`, `/logout`. Every other route
requires the `authToken` session cookie (sent automatically by the browser); there is no `Authorization`
header. Routes that act on "the current user" take the id from the cookie, not from a path segment.

### Health ([src/routes/health.routes.ts](src/routes/health.routes.ts))

| Method | Path      | Purpose                                    |
| ------ | --------- | ------------------------------------------ |
| GET    | `/health` | Liveness check, returns `{ status: "ok" }` |

### Auth ([src/routes/user.routes.ts](src/routes/user.routes.ts))

| Method | Path                         | Purpose                                                                                                                   |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/register`                  | Create a user (`name`, `surname`, `login`, `email`, `password`); rate-limited per account + per IP                        |
| POST   | `/login`                     | Authenticate, set the `authToken` cookie, return `{ message: "Logged in" }`; rate-limited per account + per IP            |
| POST   | `/logout`                    | Clear the `authToken` cookie, return `{ message: "Logged out" }` (public)                                                 |
| GET    | `/me`                        | Return the current user (including `email`, `email_verified_at`) from the cookie (session check)                          |
| PATCH  | `/me`                        | Update the current user's profile (`name`, `surname`, `avatar`)                                                           |
| DELETE | `/me`                        | Delete the current user's account; rate-limited by user id                                                                |
| POST   | `/forgot-password`           | Request a password reset link by `email`; always a generic response; rate-limited by email, every request counts (public) |
| POST   | `/reset-password`            | Set a new password from a `{ token, newPassword }` reset link (public)                                                    |
| POST   | `/change-password`           | Change the signed-in user's password (`{ currentPassword, newPassword }`); rate-limited by user id                        |
| POST   | `/resend-verification-email` | Re-send the verification link for the email on file; rate-limited by user id, every request counts                        |
| POST   | `/confirm-email`             | Verify an email from a `{ token }` verification link (public)                                                             |

### Ingredients ([src/routes/ingredient.routes.ts](src/routes/ingredient.routes.ts))

| Method | Path           | Purpose                          |
| ------ | -------------- | -------------------------------- |
| GET    | `/ingredients` | List the full ingredient catalog |

### Recipes ([src/routes/recipe.routes.ts](src/routes/recipe.routes.ts))

| Method | Path                      | Purpose                                              |
| ------ | ------------------------- | ---------------------------------------------------- |
| POST   | `/recipe`                 | Create a recipe with ingredients                     |
| GET    | `/recipes`                | List all recipes (joined with type + ingredients)    |
| GET    | `/recipe/:id`             | Single recipe with ingredients                       |
| PUT    | `/recipe/:id`             | Update a recipe                                      |
| DELETE | `/recipe/:id`             | Delete a recipe                                      |
| GET    | `/recipes-by-filters`     | Filter (name, type, ingredients, time, date, pantry) |
| GET    | `/recipes-filters-person` | Filter the current user's recipes (user from cookie) |
| GET    | `/recipes-stats`          | Aggregated stats for the analytics page              |

### Recipe types ([src/routes/type.routes.ts](src/routes/type.routes.ts))

| Method | Path            | Purpose  |
| ------ | --------------- | -------- |
| GET    | `/recipe-types` | List all |

> Recipe-type create/update/delete were removed in the 1.40 lockdown - only the read-only list remains.

### User pantry ([src/routes/userIngredients.routes.ts](src/routes/userIngredients.routes.ts))

| Method | Path                                      | Purpose                                        |
| ------ | ----------------------------------------- | ---------------------------------------------- |
| GET    | `/user-ingredients`                       | Get the current user's pantry                  |
| PUT    | `/user-ingredients`                       | Add/replace pantry items                       |
| PUT    | `/user-ingredients/update-quantities`     | Bulk update quantities (qty 0 deletes the row) |
| GET    | `/user-ingredients/history/:ingredientId` | Purchase history for one ingredient            |
| PUT    | `/user-ingredients/history/:purchaseId`   | Update a purchase entry                        |
| DELETE | `/user-ingredients/:ingredientId`         | Remove a pantry item                           |

### Menus ([src/routes/menu.routes.ts](src/routes/menu.routes.ts))

| Method | Path                   | Purpose                                              |
| ------ | ---------------------- | ---------------------------------------------------- |
| GET    | `/menu`                | All menus, paginated (also accepts category filter)  |
| GET    | `/menus`               | All menus, unpaginated (home dashboard + stats page) |
| POST   | `/create-menu`         | Create a menu with recipes                           |
| GET    | `/menu/:id`            | Menu details + recipes                               |
| PUT    | `/menu/:id`            | Update a menu                                        |
| DELETE | `/menu/:id`            | Delete a menu                                        |
| GET    | `/menu-filters-person` | The current user's menus (user from cookie)          |

### Menu categories ([src/routes/menuCategory.routes.ts](src/routes/menuCategory.routes.ts))

| Method | Path               | Purpose         |
| ------ | ------------------ | --------------- |
| GET    | `/menu-categories` | List categories |

## Data model

Full schema in the initial migration [migrations/1781185648364_initial-schema.sql](migrations/1781185648364_initial-schema.sql). Big picture:

- `person` to `recipes` via `person_id` (recipe owner); `person` also carries `email` (required, unique)
  and `email_verified_at` (nullable timestamp) - see [Auth flow](#auth-flow)
- `recipes` to `ingredients` through `recipe_ingredients` (with `quantity_recipe_ingredients`)
- `recipes.type_id` -> `recipe_types`
- `person` to `ingredients` through `person_ingredients` (the pantry, with `quantity_person_ingradient`
    - typo in the real column name, leave it) and `ingredient_purchases` (history log)
- `ingredients.id_unit_measurement` -> `unit_measurement`
- `ingredients` carries metadata: `allergens`, `days_to_expire`, `seasonality`, `storage_condition`
- `menu` (per-user, with `category_id` -> `menu_category`) to `recipes` through `menu_recipe`

The "ingredients you are missing for a menu" query joins `menu_recipe` -> `recipe_ingredients` ->
`ingredients` and subtracts the user's `person_ingredients`.

## Conventions

- Source uses TypeScript `import` / `export`; runtime semantics stay CommonJS through `tsx`.
- Controllers, use cases, and repositories are classes wired via the composition root (constructor DI).
  Repositories implement an interface from `src/domain/repositories/` and hold all SQL - match the
  pattern.
- Cross-folder backend imports use bare path aliases from [tsconfig.json](tsconfig.json) `paths` (no
  `baseUrl` - it's deprecated in TypeScript 6): `constants/*`, `domain/*`, `application/*`,
  `infrastructure/*`, `controller/*`, `routes/*`, `middleware/*`, `config/*`, `i18n/*`, `test/*`, plus
  the singleton aliases `app` and `composition-root`. Keep same-folder imports relative with `./`; never
  use `../` across folders.
- Comments are plain `//` with a single space and a lowercase first letter (acronyms keep their case, e.g. `// JWT login`). The old `//?` / `//!` prefixes were removed.
- Raw SQL with `$1`, `$2`, ... parameters via `db.query(text, values)` - never string-concatenate
  user input.

## Versioning

The whole project shares one version and one changelog at the repo root. This package's version in
[package.json](package.json) marks the last release in which the backend changed. See the
[root README](../README.md#versioning-and-changelog) and [root CHANGELOG.md](../CHANGELOG.md).

## Related

- [Root README](../README.md) - project overview and monorepo scripts
- [Frontend README](../frontend/README.md) - React client
- [CHANGELOG.md](../CHANGELOG.md) - project changelog
- [CLAUDE.md](../CLAUDE.md) - notes for AI tooling
