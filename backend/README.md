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

Migrations and seed run before the new containers go live, as a one-shot container started by the
deploy script:

```bash
node dist/scripts/deploy-db.js
```

`deploy-db.js` is a single entry point that runs migrations then seed in one Node process (no shell needed).

All secrets (`JWT_SECRET_KEY`, `DB_*`, `CORS_ORIGIN`, etc.) come from an `.env` file that lives only on the
server - never baked into the image, never in the repo. See [Required configuration](#configuration) for the full list.

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
MEDIA_DIR=<directory uploaded photos are written to; default uploads, relative to the working directory>
RESEND_API_KEY=<Resend API key; leave empty to use the logging fallback>
EMAIL_FROM=<e.g. noreply@example.com; leave empty to use the logging fallback>
```

`NODE_ENV=production` turns on the `Secure` flag of the auth cookie. `COOKIE_DOMAIN` is left empty in dev
(a host-only cookie); in production set the shared parent domain (e.g. `.example.com`) so `app.*` and
`api.*` subdomains share the session cookie. See [src/config/cookie.ts](src/config/cookie.ts).

`JWT_SECRET_KEY` is used by [src/middleware/jwtMiddleware.ts](src/middleware/jwtMiddleware.ts) (verifies
tokens) and [src/infrastructure/security/JwtTokenService.ts](src/infrastructure/security/JwtTokenService.ts)
(signs them at login). It must be at least 32 characters (validated on startup), and in production the server refuses to start
without it at all. In development, without it, login and every protected route return a 500 configuration
error.
The rest of the env is validated with zod on startup; invalid ports or logger levels fail fast with a
clear configuration error. `LOG_LEVEL` controls the pino logger level and defaults to `info` when unset.

`RESEND_API_KEY` and `EMAIL_FROM` configure transactional email (password reset and email verification
links). Leave both empty for local dev/CI: the composition root picks `LoggingEmailService`, which logs
the link instead of sending it, so the flows work end to end without a real Resend account. If either is
set, both must be set - the app fails fast on startup otherwise
([src/config/env.ts](src/config/env.ts)'s `assertConsistentEmailConfig`). With both set,
`ResendEmailService` calls Resend's REST API via native `fetch`.

`MEDIA_DIR` is where uploaded photos land. In the image it resolves to `/app/uploads`, which the
Dockerfile creates and hands to the unprivileged `node` user, and production mounts the `uploads` named
volume there so photos outlive every container. Locally the default `backend/uploads/` is gitignored.

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
    ├── scripts/             migrate.ts, seed.ts (thin CLI entry points); runMigrations.ts, runSeed.ts (shared logic); deploy-db.ts (migrate + seed in one process, used by the deploy script)
    ├── app.ts                createApp(controllers); mounts middleware, health, and routers without listening
    ├── index.ts              runtime entry; listens on 3000 and shuts down server + pg pool cleanly
    ├── composition-root.ts   dependency injection: buildControllers(deps), plus real pg wiring
    ├── composition-root.recipe.ts / .user.ts   companion files for the two largest controllers
    ├── db.ts                 pg.Pool connection (reads DB_* env via config/env.ts)
    ├── config/env.ts         typed env loading and JWT secret guard (isProduction, cookieDomain, corsOrigin)
    ├── config/logger.ts      shared pino logger, LOG_LEVEL-aware and silent in tests
    ├── config/cookie.ts      AUTH_COOKIE_NAME + AUTH_COOKIE_OPTIONS (httpOnly, sameSite, secure, maxAge)
    ├── config/security.ts    rate-limit configs, purpose-token TTLs, SESSION_TOKEN_TYPE, DUMMY_PASSWORD_HASH
    ├── constants/             routes.ts (every API path), errorCodes.ts (ERROR_CODES - the error contract),
    │                          pagination.ts, avatarKeys.ts
    ├── i18n/                 translate.ts + locales/<locale>/ catalogs: errors.json (text per error code),
    │                          messages.json (success messages), email.json (transactional email copy)
    │
    ├── domain/               innermost layer (no framework/db deps)
    │   ├── entities/         Recipe, Menu (only entities that enforce an invariant)
    │   ├── errors/           AppError + Validation/Unauthorized/Forbidden/NotFound/ConflictError (code + HTTP status)
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
    │   ├── jwtMiddleware.ts  createSessionAuth - authenticateToken and optionalAuth: verify the JWT from the
    │   │                     authToken cookie and its session version, attach req.user
    │   ├── rateLimit.ts      createGlobalLimiter + per-route limiters: login/register (each with a
    │   │                     stricter per-login limiter and a looser per-IP one), forgotPassword,
    │   │                     resetPassword, changePassword, resendVerification, confirmEmail, deleteAccount
    │   └── errorHandler.ts   turns every error into a { error, code } response (mounted last)
    │
    ├── routes/               route factories (controller) => router, all under /api
    │   └── *.routes.ts       paths come from constants/routes.ts, never written inline
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
  `/login`, `/logout`, `/forgot-password`, `/reset-password`, and `/confirm-email`). Paths are never
  literals here: they live in [src/constants/routes.ts](src/constants/routes.ts) as `ROUTES`, grouped
  by domain and router-relative, alongside `API_PREFIX` (the `/api` mount) and `HEALTH_PATH` (derived
  from both, because request logging has to filter the probe out by its full path).
- **controller/** - thin classes; a handler reads `req`, calls a use case, sends the response. No try/catch.
- **application/validation/** - zod request schemas and the shared `validate()` helper. Schemas describe
  request shape only (types, required scalars, formats, ranges, array item shape).
- **application/use-cases/** - one class per operation with `execute(...)`: input validation + orchestration;
  throw domain errors; depend on repository/service interfaces only. Service ports in **application/ports/**.
- **domain/** - repository interfaces, entities, and `errors/AppError.ts` (errors carry a `code` and an HTTP `status`).
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
replies `{ error, code }` with `err.status || 500`. Every error body has that shape, and every one goes
through `errorHandler` - auth middleware failures, rate-limit rejections and the JSON 404 for unknown
routes call `next(error)` instead of writing a response themselves. Transactions live inside a single
repository method (see menu/pantry repos).

### Error codes and the message catalog

- **The code is the contract.** Every client-facing error is an `AppError` carrying one value from
  `ERROR_CODES` ([src/constants/errorCodes.ts](src/constants/errorCodes.ts)), namespaced by domain
  (`recipe/not_found`, `auth/session_expired`). The frontend switches on the code and renders its own
  copy; the English `error` text is a fallback. A new error = one `ERROR_CODES` entry + one line in
  `errors.json` in every `i18n/locales/<locale>/` + the same entry in the frontend mirror (`frontend/src/constants/errorCodes.ts`) -
  a missing catalog line is a compile error, and a test fails if the frontend mirror drifts either way. The frontend's own copy for each code lives under `apiErrors` in
  every frontend `common.json`, guarded by the frontend sync and completeness tests.
- **No display text in `AppError`.** It holds `code`, `status` and an optional `detail` (request-specific
  context, e.g. the zod issue list on `validation_error`). `errorHandler` resolves the text at the HTTP
  edge - `detail ?? translateError(code, locale)`.
- **Every piece of server copy is written in a locale, and there are exactly two sources for it.** A
  response - error text and `{ message }` bodies alike - follows the request: `requestLocale(req)`
  ([src/i18n/requestLocale.ts](src/i18n/requestLocale.ts)) picks the best match for `Accept-Language`
  among `LOCALES` ([src/constants/locales.ts](src/constants/locales.ts) - `en`, `pl`, `ru`, `uk`, the
  frontend's list, which a test compares), falling back to `en`; the app sends the language it is
  showing, so a signed-in visitor's choice arrives that way. An email follows the recipient's stored
  `person.locale` instead, since it is read long after the request - registration stores the request's
  language, and `PUT /me/locale` changes it. Its link opens the page in that language too (`emailLink`
  adds the `/<locale>` prefix the frontend serves every language but English under). The translate functions take the locale
  as a required argument, so a call site cannot quietly default to English. Adding a locale is one
  `LOCALES` entry, a new `i18n/locales/<locale>/` folder and one entry in `CATALOGS`
  ([src/i18n/translate.ts](src/i18n/translate.ts)); `satisfies Record<Locale, Catalog>` rejects a locale
  missing any key.
- **Internal failures are not `AppError`s.** A misconfiguration or programming error (missing JWT secret,
  a route without `req.user`) throws a plain `Error`; every 5xx is answered as `server_error` and never
  leaks its message.
- **Log levels follow the status**: a 4xx is one compact `warn` line (`status`, `code`, text - no stack, so bots
  probing unknown routes can't crowd the rotated logs), a 5xx is logged in full at `error`.
- Success messages (`{ message }`) come from `translateMessage(key)`, email copy from `getEmailCopy()`.
- Tests assert domain errors by code: `expect(err).toBeAppError(Class, ERROR_CODES.X, status, detail?)`,
  and integration tests compare bodies with `errorBody(ERROR_CODES.X)` from `src/test/helpers/errorBody.ts`.

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
   `{ id, typ: "session", sv }`, `expiresIn: "24h"`) via `JwtTokenService`, where `sv` is the account's
   `session_version`. The controller sets it with
   `res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)` (`httpOnly`, `sameSite: "lax"`, `secure` in
   production, `domain` from `COOKIE_DOMAIN`, `maxAge` 24h) and responds `{ message: "Logged in" }`.
2. The browser sends the cookie automatically on later requests (`cookie-parser` + CORS `credentials: true`).
3. [src/middleware/jwtMiddleware.ts](src/middleware/jwtMiddleware.ts) reads the JWT from
   `req.cookies[AUTH_COOKIE_NAME]`, verifies it with `JWT_SECRET_KEY` (HS256 only) and compares its `sv` with
   the account's current `session_version` - `401` if the cookie is missing, `403` if it is invalid, expired
   or issued before the password last changed - then attaches `req.user = { id }` and calls `next()`.
   Changing or resetting the password raises `session_version`, so every other session ends at once;
   `/change-password` re-issues the cookie for the session that made the change.
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

8. Every error response carries a stable machine-readable `code` alongside its text (see
   [Error codes and the message catalog](#error-codes-and-the-message-catalog)), so the frontend can show
   the exact right copy per cause instead of guessing from the HTTP status. A missing or invalid session
   answers `auth/session_expired` (`401`/`403`), a rate-limit rejection `rate_limited` (`429`).

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
| PUT    | `/me/locale`                 | Set the account's language (`{ locale }`, one of the server's catalogs) - what its emails are written in (204)            |
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

| Method | Path                      | Purpose                                                                                            |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------------- |
| POST   | `/recipe`                 | Create a recipe with ingredients                                                                   |
| GET    | `/recipes`                | List all recipes (joined with type + ingredients)                                                  |
| GET    | `/recipe/:id`             | Single recipe with ingredients                                                                     |
| PUT    | `/recipe/:id`             | Update a recipe                                                                                    |
| DELETE | `/recipe/:id`             | Delete a recipe                                                                                    |
| GET    | `/recipes-by-filters`     | Filter (name, type, ingredients, time, date, pantry, favourites, rating, allergens, avoided, tags) |
| GET    | `/recipes-filters-person` | Filter the current user's recipes (user from cookie)                                               |
| GET    | `/recipes-stats`          | Aggregated stats for the statistics page                                                           |
| PUT    | `/recipe/:id/favourite`   | Add the recipe to the current user's favourites (204, idempotent)                                  |
| DELETE | `/recipe/:id/favourite`   | Remove it from the current user's favourites (204, idempotent)                                     |
| PUT    | `/recipe/:id/rating`      | Rate the recipe `{ value: 1..5 }`, replacing the user's earlier vote (204)                         |
| DELETE | `/recipe/:id/rating`      | Take the user's vote back (204, idempotent)                                                        |

Every search/list and detail response carries `isOwner` and `isFavourite` computed for the requester;
`isFavourite` is `null` when the request has no session. `favourites=true` narrows a list to the
requester's favourites and is refused for a guest with `favourites/requires_login`. Favourite writes
live in [src/routes/favourite.routes.ts](src/routes/favourite.routes.ts); adding a favourite for a
recipe or menu that does not exist answers `404`, removing one that isn't there is a no-op.

Search and detail responses also carry `containsAvoided` - `true` when any ingredient, or one of its
allergens, is on the requester's avoid list, `null` for a guest. Without an explicit `sort_order` a signed-in
requester's list is ranked by it: favourites first, anything avoided last (favourites still lead among those),
then newest. `hide_avoided=true` drops those recipes and is refused for a guest with `diet/requires_login`;
`exclude_allergens=gluten,milk` leaves out recipes with any listed allergen and works for everyone.

Every recipe and menu carries the `language` it is written in (`en`, `pl`, `ru` or `uk`); creating or
updating one requires it. Search and detail responses return it, and `languages=pl,uk` keeps records
written in any of the listed languages - for everyone, guests included. The column was added with a
backfill that guessed existing rows' language from their text.

Ratings: search and detail responses carry `ratingAverage` (unrounded, `null` for a record nobody has
rated), `ratingCount` and the requester's own `myRating` (`null` for a guest and for anyone who hasn't
voted). A rating for a record that does not exist answers `404`, one on the requester's own recipe or menu
`400 ratings/own_record`. `top_rated=true` keeps records averaging 4 or more and works for everyone;
`sort_order=rating` ranks by a Bayesian average (`RATING_SORT_PRIOR` in `constants/ratings.ts`), so one
five-star vote can't outrank fifty votes averaging 4.8. Rating writes live in
[src/routes/rating.routes.ts](src/routes/rating.routes.ts).

`GET /recipes` and `GET /recipes-stats` both use explicit columns rather than `SELECT r.*`, so
neither ships a recipe's raw owner `person_id` to the client - the same rule the list/search
endpoints already followed. `/recipes-stats` computes every aggregate (type distribution, cooking
time and calorie extremes/averages, most-used type) in SQL across every recipe, not just the
current user's - the statistics page reads it directly instead of downloading the whole recipe
table and aggregating client-side.

### Recipe types ([src/routes/type.routes.ts](src/routes/type.routes.ts))

| Method | Path            | Purpose  |
| ------ | --------------- | -------- |
| GET    | `/recipe-types` | List all |

> Recipe-type create/update/delete were removed in the 1.40 lockdown - only the read-only list remains.

### User pantry ([src/routes/userIngredients.routes.ts](src/routes/userIngredients.routes.ts))

| Method | Path                                      | Purpose                                                               |
| ------ | ----------------------------------------- | --------------------------------------------------------------------- |
| GET    | `/user-ingredients`                       | Get the current user's pantry, each ingredient with its purchase lots |
| PUT    | `/user-ingredients`                       | Add/replace pantry items                                              |
| GET    | `/user-ingredients/history/:ingredientId` | Purchase history for one ingredient                                   |
| PUT    | `/user-ingredients/history/:purchaseId`   | Update a purchase entry                                               |
| DELETE | `/user-ingredients/:ingredientId`         | Remove a pantry item                                                  |

### Menus ([src/routes/menu.routes.ts](src/routes/menu.routes.ts))

| Method | Path                   | Purpose                                                                     |
| ------ | ---------------------- | --------------------------------------------------------------------------- |
| GET    | `/menu`                | All menus, paginated (category, favourites and rating filters, rating sort) |
| GET    | `/menus`               | All menus, unpaginated (home dashboard + stats page)                        |
| POST   | `/create-menu`         | Create a menu with recipes                                                  |
| GET    | `/menu/:id`            | Menu details + recipes                                                      |
| PUT    | `/menu/:id`            | Update a menu                                                               |
| DELETE | `/menu/:id`            | Delete a menu                                                               |
| GET    | `/menu-filters-person` | The current user's menus (user from cookie)                                 |
| PUT    | `/menu/:id/favourite`  | Add the menu to the current user's favourites (204)                         |
| DELETE | `/menu/:id/favourite`  | Remove it from the current user's favourites (204)                          |
| PUT    | `/menu/:id/rating`     | Rate the menu `{ value: 1..5 }` (204), as for recipes                       |
| DELETE | `/menu/:id/rating`     | Take the user's vote back (204, idempotent)                                 |

### Shopping list ([src/routes/shoppingList.routes.ts](src/routes/shoppingList.routes.ts))

| Method | Path                         | Purpose                                                                                             |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| GET    | `/shopping-list`             | The current user's items, in list order                                                             |
| POST   | `/shopping-list`             | Add a free-text item `{ name, note? }` (201 with the item)                                          |
| PATCH  | `/shopping-list/:id`         | Change `note` and/or `checked` (200 with the item)                                                  |
| DELETE | `/shopping-list/:id`         | Remove one item (204)                                                                               |
| DELETE | `/shopping-list/checked`     | Remove every checked item (204)                                                                     |
| PUT    | `/shopping-list/order`       | Reorder with the full list of ids `{ ids }` (204)                                                   |
| POST   | `/shopping-list/ingredients` | Add catalog ingredients `{ items: [{ ingredient_id, quantity }] }` (204) - `quantity` may be `null` |

A list holds at most 200 items; an add past that answers 409 `shopping_list/limit_reached`. Adding an
ingredient that already has an unchecked item adds the new quantity to that item instead of listing it
twice (the first such item, if unticking left two), so ingredients from two recipes sum up; a `null` quantity
never erases a known one. An add for an account deleted while its session was still valid answers 404
`auth/user_not_found`. Items keep the name they were added with - `PATCH` changes only `note` and `checked`.
A reorder must name
exactly the current items - otherwise 409 `shopping_list/order_out_of_date`, and the client refetches.
`/shopping-list/checked` is registered before `/shopping-list/:id`, which would otherwise read
`checked` as an id.

### Food preferences ([src/routes/dietPreferences.routes.ts](src/routes/dietPreferences.routes.ts))

| Method | Path                                | Purpose                                                      |
| ------ | ----------------------------------- | ------------------------------------------------------------ |
| GET    | `/diet-preferences`                 | What the current user avoids `{ allergens, ingredient_ids }` |
| PUT    | `/diet-preferences/allergens/:slug` | Avoid one of the 14 EU allergens (204, idempotent)           |
| DELETE | `/diet-preferences/allergens/:slug` | Stop avoiding it (204, idempotent)                           |
| PUT    | `/ingredient/:id/avoid`             | Avoid a catalog ingredient (204, idempotent)                 |
| DELETE | `/ingredient/:id/avoid`             | Stop avoiding it (204, idempotent)                           |

One toggle per request, so two quick taps can't overwrite each other the way replacing the whole set would.
An unknown allergen slug is a 400, an ingredient missing from the catalog a 404 `ingredient/not_found`, and a
write for an account deleted while its session was still valid a 404 `auth/user_not_found`. The allergen list
lives in [src/constants/allergens.ts](src/constants/allergens.ts), shared with the catalog scripts.

### Tags ([src/routes/tag.routes.ts](src/routes/tag.routes.ts))

| Method | Path               | Purpose                                         |
| ------ | ------------------ | ----------------------------------------------- |
| GET    | `/tags`            | The current user's tags, by name                |
| POST   | `/tags`            | Create a tag (201 with the tag)                 |
| PATCH  | `/tags/:id`        | Rename it (204)                                 |
| DELETE | `/tags/:id`        | Delete it, unlinking it from every recipe (204) |
| PUT    | `/recipe/:id/tags` | Replace the user's tags on that recipe (204)    |

Tags are private: a name is unique per person regardless of case (`tags/duplicate_name`), there is a
cap of 50 per person (`tags/limit_reached`) and 10 per recipe, and another person's tag answers 404
`tags/not_found` rather than admitting it exists. A tag can go on any recipe the user can see, not
just their own. Search and detail responses carry the requester's own `tags` (`null` for a guest),
and `tag_ids=3,4` filters the list down to recipes carrying any of them - a guest gets a 400
`tags/requires_login`.

### Photos ([src/routes/photo.routes.ts](src/routes/photo.routes.ts), [src/routes/media.routes.ts](src/routes/media.routes.ts))

| Method | Path                | Purpose                                                       |
| ------ | ------------------- | ------------------------------------------------------------- |
| PUT    | `/recipe/:id/photo` | Set or replace a recipe's photo (owner only, `{ photo_key }`) |
| DELETE | `/recipe/:id/photo` | Remove it (204)                                               |
| PUT    | `/menu/:id/photo`   | Set or replace a menu's cover (owner only, `{ photo_key }`)   |
| DELETE | `/menu/:id/photo`   | Remove it (204)                                               |
| PUT    | `/me/avatar`        | Set or replace the current user's photo (`{ photo_key }`)     |
| DELETE | `/me/avatar`        | Remove it (204)                                               |
| GET    | `/media/:file`      | Serve a stored photo (public; see the renditions below)       |

The upload body is the image itself (any `Content-Type`, up to 10 MB), read by `express.raw` on these
routes only, after auth and a per-user limiter (20 uploads per 10 minutes). The server never trusts
the name or type it is told: it sniffs the bytes for JPEG, PNG, WebP or AVIF (anything else, SVG
included, is `media/unsupported_type`), then `sharp` decodes and re-encodes the picture into three
renditions - WebP at 400 and 1200 px (`<key>-400.webp`, `<key>-1200.webp`, scaled down, never up) and
a 1200x630 JPEG cropped around the most prominent region (`<key>-og.jpg`), which link previews use
because every messenger renders JPEG in that frame - capped at 40 megapixels, refusing truncated files (`media/unreadable`), applying the
EXIF orientation and dropping every piece of metadata, GPS included. Only the re-encoded files are
kept, under a server-generated UUID, written before the database points at them; the previous photo's
files are deleted after the new key is stored. Deleting a recipe, a menu or an account deletes its
photos too: the delete statement returns the keys it removed (`DELETE ... RETURNING`), and `PhotoCleanup`
removes those files once the transaction commits, so an upload racing the delete cannot orphan its files.

`GET /media/...` is mounted before the global limiter and left out of request logs, since a page of
cards is dozens of image requests. It accepts only the exact file-name shape the server generates and
answers `image/webp` or `image/jpeg` - taken from that name, never from the request - with
`X-Content-Type-Options: nosniff`, `Content-Disposition: inline`, a year-long
immutable cache (a new photo is a new key) and `Cross-Origin-Resource-Policy: same-site`, so the app
domain may load it while any other site may not.

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
- `recipe_favourites` / `menu_favourites` - one row per person and favourited recipe / menu (composite
  primary key, so a repeat add is a no-op). Every foreign key is `ON DELETE CASCADE`: recipe, menu and
  account deletion are hand-written transactions that know nothing about favourites.
- `recipe_ratings` / `menu_ratings` - one row per person and rated recipe / menu (`value` 1-5; the
  composite primary key is the one-vote-per-person rule). Every foreign key is `ON DELETE CASCADE`.
  `recipes` and `menu` carry running `rating_sum` / `rating_count` totals kept by an `AFTER` trigger on
  the vote tables, never by repository code: a deleted account takes its votes with it through a cascade,
  and only a trigger sees that. The average is derived from the totals on read, never stored.
- `person` to `ingredients` through `person_ingredients` (the pantry aggregate, with
  `quantity_person_ingradient` - typo in the real column name, leave it) and `ingredient_purchases`
  (one row per purchase lot). Expiry is computed per lot from `ingredient_purchases.purchase_date`,
  not the aggregate's own date - a top-up must not "refresh" older stock's expiry.
- `shopping_list_items` - one row per item on a person's shopping list: free text, or a catalog
  ingredient with a quantity (`ingredient_id` is `ON DELETE SET NULL`, so the item outlives it as text).
  Writes lock the owner's `person` row, so the 200-item limit and the next `position` can't race.
- `person_avoided_allergens` / `person_avoided_ingredients` - a person's avoid list (composite primary keys,
  every foreign key `ON DELETE CASCADE`). Search and detail queries turn it into the per-requester
  `containsAvoided` column (`containsAvoidedColumn.ts`), which also drives the default ranking and
  `hide_avoided`.
- `person_tags` / `recipe_tag_links` - a person's private tags and what they put them on (both
  foreign keys `ON DELETE CASCADE`, one unique index on `(person_id, lower(name))`). Search and detail
  queries turn them into the per-requester `tags` column (`recipeTagsColumn.ts`), which also backs the
  `tag_ids` filter.
- `recipes.photo_key`, `menu.photo_key` and `person.avatar_photo_key` - nullable UUIDs naming the
  stored photo files. `person.avatar` keeps the preset avatar key beside the photo, so removing the
  photo brings the preset back. Search and detail responses carry the record's `photo_key` and an
  `author` object (`authorColumn.ts`: first name, surname initial, preset avatar and photo - never the
  login or email).
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
- [AGENTS.md](../AGENTS.md) - notes for AI coding agents
