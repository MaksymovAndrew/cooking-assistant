# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two-app monorepo (no workspaces - each side has its own `package.json`):

- [backend/](backend/) - Node.js + Express 5 + TypeScript + PostgreSQL (`pg`) API on port `3000`; helmet, express-rate-limit, pino, and zod provide operational hardening and input validation; source lives under [backend/src/](backend/src/)
- [frontend/](frontend/) - React 19 + TypeScript + Vite on port `8080` (SCSS modules, React Router v7)
- Database schema is managed by `node-pg-migrate`: SQL migrations live in [backend/migrations/](backend/migrations/) (the initial one captures the full current schema) and reference/sample data is loaded by [backend/src/scripts/seed.ts](backend/src/scripts/seed.ts).
- Root [package.json](package.json) is an orchestration shim: it pulls in `concurrently` and exposes scripts that drive both sub-packages. It also holds the single shared project version (see [Versioning](#versioning) below).
- [CHANGELOG.md](CHANGELOG.md) at the root is the single changelog for the whole project.

## Common commands

Preferred - from repository root ([package.json](package.json)):

```bash
npm install              # installs root + auto-runs postinstall in backend & frontend
npm start                # OR npm run dev - concurrently boots backend (3000) + frontend (8080)
npm run start:backend    # backend only (tsx watch)
npm run start:frontend   # frontend only (vite)
```

Every per-app quality command has a root aggregate too - `lint`, `lint:fix`, `lint:sonarjs`, `stylelint`, `stylelint:fix`, `typecheck`, `test`, `test:coverage`, `build` (frontend), `build:backend`, `verify` - and all scripts are cross-platform (plain node CLIs, no shell-specific syntax), so they behave identically on Windows, macOS and Linux. Two more root scripts cover the slower suites, deliberately kept out of `test`/`verify`/the pre-commit hook: `test:e2e` (Playwright smoke suite against a live dev stack, see [e2e/](e2e/)) and `test:db` (Testcontainers real-Postgres repository suite, see [backend/src/test/db-integration/](backend/src/test/db-integration/)) - both need Docker.

The root `postinstall` hook (`npm --prefix backend install && npm --prefix frontend install`) means a single `npm i` at the root populates all three `node_modules`. Don't add a separate `install:all` script.

Per-app, if you need it directly:

Backend ([backend/](backend/)):

```bash
npm run dev        # tsx watch -> http://localhost:3000
npm start          # tsx src/index.ts, no auto-reload
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run test       # jest via ts-jest
npm run migrate    # node-pg-migrate: apply all pending migrations (up); `migrate down` rolls back one
npm run seed       # load reference + sample data (idempotent)
```

Frontend ([frontend/](frontend/)):

```bash
npm run dev      # vite dev server -> http://localhost:8080
npm run build    # tsc -b && vite build  (real type-check happens here)
npm run preview  # serve production build
npm run lint     # eslint .
```

Both sides have a Jest suite with an 80% coverage gate (`test` / `test:coverage`). Backend uses ts-jest + Supertest; frontend uses @swc/jest + React Testing Library + jsdom (~108 co-located `__tests__` files).

Backend test conventions (match these when adding tests):

- Business-logic unit tests stay no DB, no Express. Use cases and domain entities are tested with fake repositories/ports built from `jest.fn()`; mock only what is necessary.
- Middleware unit tests call the middleware directly with mocked `req`/`res`/`next`.
- Supertest integration tests use `buildTestApp` with fake repositories/ports. They exercise real routes, auth middleware, controllers, use cases, and `errorHandler` without a database.
- Pg-repository tests run against a real Postgres via Testcontainers, in a separate suite: [backend/src/test/db-integration/](backend/src/test/db-integration/), run with `npm run test:db` (its own `jest.db.config.js`, a `globalSetup`/`globalTeardown` pair that starts one shared container and applies migrations, and a `testPool.ts` helper each test file's worker process reads the connection info from). Not part of `npm test`/the pre-commit hook (needs Docker, slower) - it has its own CI job instead. Do not add mock-pool SQL-string tests as a substitute for this suite.
- Unit tests are co-located in `__tests__/` next to the unit, named `<Unit>.test.ts`; HTTP integration tests live in `backend/src/test/integration/`.
- Test names start with "should": `it("should ...")`.
- Assert domain errors with the custom matcher `expect(err).toBeAppError(Class, message, status)` ([backend/src/test/jest.setup.ts](backend/src/test/jest.setup.ts)); capture thrown errors with `catchError` / `catchSyncError` ([backend/src/test/helpers/assertions.ts](backend/src/test/helpers/assertions.ts)).

Frontend test conventions (read [frontend/src/test/jest.setup.ts](frontend/src/test/jest.setup.ts) and [frontend/jest.config.cjs](frontend/jest.config.cjs) first):

- Co-located `__tests__/` named `<Unit>.test.ts(x)`; `it("should ...")`; prefer `act` over `waitFor`.
- API-layer tests `jest.mock("../client")` and assert against the typed mocks in [frontend/src/test/apiClientMock.ts](frontend/src/test/apiClientMock.ts). Component/page/hook tests mock the higher-level api wrapper (`jest.mock("api/recipesApi")`), never the axios client.
- Render with `renderWithRouter` from [frontend/src/test/router.tsx](frontend/src/test/router.tsx) (defaults to a non-root route; asserts navigation via the shared `mockNavigate`). `config/env` and `config/logger` are mocked globally via `moduleNameMapper`.
- No `as any`; real domain types from `types/*` for fixtures.

End-to-end smoke tests live at the repo root in [e2e/](e2e/) (Playwright, [playwright.config.ts](playwright.config.ts)), run with `npm run test:e2e`. They boot both dev servers (reusing an already-running `npm start` locally; fresh servers in CI) and drive real login/CRUD flows through a Chromium browser - `smoke.spec.ts` is the golden path (the only spec that registers its own account, since registration/login is the feature it exercises), `core-flows.spec.ts` covers edit/delete/pantry/theme-toggle flows expected to survive the upcoming page redesign, `routes-smoke.spec.ts` visits every route in [frontend/src/constants/routes.ts](frontend/src/constants/routes.ts) (list/detail/form pages plus the not-found page) so a redesign that blanks a page fails here even without a dedicated flow test, `search-filter.spec.ts` exercises recipe/menu search, type/category filters and sort order, `ownership.spec.ts` verifies the public-read/owner-only-write contract (view as another user, hidden edit/delete controls, 404 on a non-owner's update), and `pantry-details.spec.ts` covers purchase-history viewing and full ingredient removal. `global-setup.ts` registers two shared accounts (`primary`/`viewer`) once per run and saves their sessions via Playwright `storageState`; every spec besides `smoke.spec.ts` reuses one of these instead of registering its own, keeping the whole suite's login/register traffic well under the auth rate limiter - see [e2e/sharedAccounts.ts](e2e/sharedAccounts.ts). Not part of `npm test`/the pre-commit hook - it has its own CI job instead.

## Versioning

The whole project shares ONE version, stored in the root [package.json](package.json). It increments by one each release (for example `1.3 -> 1.4`).

A release also bumps `backend/package.json` and/or `frontend/package.json` up to the shared number, but only for the side(s) actually changed. An untouched side keeps its old number. So a package version is a marker of "the last release in which this package changed" and may skip numbers - it is NOT strict SemVer.

Worked example:

- `1.2` changed only the backend: `backend` went to `1.2`, `frontend` stayed on its previous number.
- `1.3` changed both: both went to `1.3`.
- A later `1.5` that changes only the backend takes `backend` straight to `1.5` (skipping `1.4`, which it was not part of); `frontend` stays where it was.

Rule of thumb: the version takes care of itself. The pre-commit hook runs [scripts/release-version.mjs](scripts/release-version.mjs) in `precommit` mode: on a `release/X.Y` branch it reads the target from the branch name, sets the root `package.json`, raises only the side(s) with changes vs `main`, syncs the lockfile `version` fields, and `git add`s whatever it rewrote so the bump rides along in that same commit (silent no-op when everything already matches; skipped by `SKIP_CHECKS=1` like the other checks; a manual mid-release patch like `3.3.1` in the root wins over the branch default). `npm run bump` (optionally `-- 3.4`) runs the same logic manually. Do not use `npm version` or edit version fields by hand.

## Changelog

There is ONE changelog: root [CHANGELOG.md](CHANGELOG.md). There are no per-package changelogs.

1. Each release is a `## [x.y] - YYYY-MM-DD` heading containing `### Backend` and/or `### Frontend` subsections. Omit the subsection for a side that was not touched.
2. While work is in flight, add entries under the top `## [Unreleased]` heading; at release time, move them into a new dated version heading and leave `## [Unreleased]` empty.
3. Write entries from the user's perspective, not the code's. Good: "Filter recipes by cooking time range". Bad: "Add `time_min`/`time_max` query params to `/api/recipes-by-filters`".
4. Use Keep a Changelog wording where it helps (`Added`, `Changed`, `Fixed`, `Removed`, `Security`), but the `### Backend` / `### Frontend` split is the primary structure here.

## Commit and PR conventions

One commit = code change + version bump + changelog update. Bundle them together.

Message format: `<version>: <short description>` - the shared target version, for example:

```
1.4: add cooking-time filter to the recipe list
1.5: fix menu deletion leaving orphaned rows
```

Optionally note the side when only one changed: `1.4 (frontend): ...`. The version in the message lets GitLens blame hover show which release a line landed in (a confirmed user preference).

Hard rules:

- Do NOT create git tags for versions. Exception: a `v*` deploy tag (e.g. `v2.0`) triggers the production
  deploy pipeline - only the user creates these, never Claude.
- Do NOT add a `Co-Authored-By` trailer to commits.
- Do NOT commit directly to `main`. Branch from `main`, named after the release (for example `release/1.4`), commit there, push, and open a PR for review.
- Never `git push` without explicit user permission.

Preferred git commands (use these exact forms):

```
git switch main          # switch to existing branch
git switch -c release/X.Y   # create and switch to new branch
git add .                # stage all changes
git push origin release/X.Y  # push branch (no -u flag)
```

### PR / MR description

Keep the body short and to the point - what was **added** and what was **fixed**, nothing else. Two optional bulleted sections; omit either if it has nothing:

```
<version>: <same text as the commit title>

Added:
- <new capability, in user-facing language>

Fixed:
- <bug fixed, in user-facing language>
```

PR title = the commit title (`<version>: <description>`). One bullet per change, in plain language (what it means for a user, not the code). Default to just `Added`/`Fixed`; only reach for `Changed`/`Removed`/`Security` if a change is genuinely neither. No verification/"Checks" line, no Claude/Co-Authored-By attribution.

### Quality gates (CI + hooks)

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every PR and on push to `main`: a root `format` (Prettier check), then per side `lint` (ESLint), `typecheck`, `sonarjs` (SonarJS lint), and `test:coverage` (Jest, 80% gate); the frontend additionally runs `build` (`tsc -b && vite build`) and `stylelint`. Two more jobs run the slower suites: `e2e` (Playwright smoke suite, starts both dev servers + a Postgres service + runs migrate/seed) and `test-backend-db` (Testcontainers real-Postgres repository suite - no `services:` needed, it manages its own container via the runner's Docker daemon). A `ci-success` job aggregates all of them and is the single required check - all must be green to merge. The same quick suite runs locally before a commit via the Husky `pre-commit` hook (lint-staged + both sides' typecheck/lint/sonarjs/tests, plus frontend stylelint); `pre-push` both blocks pushing straight to `main` and runs the frontend build. `npm run verify` reproduces the CI gates locally in one command (e2e/db-integration are deliberately excluded - run `test:e2e`/`test:db` separately when Docker is available). Hosted SonarCloud is not wired up (no `SONAR_TOKEN`); the local `sonarjs` lint covers the static-analysis role for now.

**Escape hatches (ops-only commits - never use when touching `backend/src` or `frontend/src`):**

- `git skip-checks commit -m "<msg>"` / `git skip-checks push origin <branch>` - the convenient form. `git skip-checks <cmd>` is a repo-local alias (in `.git/config`, NOT global; auto-installed on `npm install` via `scripts/setup-skip-alias.mjs`) that runs the command with `SKIP_CHECKS=1`. Scoped to that one command and works in any shell - a plain `git commit` afterwards runs the full checks as usual. Use only for pure ops-only changes: `.github/workflows/`, `.husky/`, docs, changelog.
- Under the hood, `SKIP_CHECKS=1` on a commit skips all local pre-commit checks AND, via the `prepare-commit-msg` hook, auto-stamps `[skip-checks]` onto the commit subject so all 11 CI jobs skip too; `ci-success` still passes (`skipped != failed`), so the PR can merge. On a push it also skips the pre-push frontend build (`SKIP_HOOKS=1` stays as a backward-compat alias). The direct-push-to-main block in `.husky/pre-push` is a policy guard and is NOT bypassed by either flag.
- In CI a `gate` job reads the head commit message (it checks out the PR head sha, since `pull_request` events carry no `head_commit`) and the other jobs skip when it finds `[skip-checks]`. So the commit marker is authoritative on both `push` and PR - the PR title does not need it. The PR title is still honored as a fallback. CI re-evaluates per push, so the tip commit of the latest push decides.

## Required configuration

1. PostgreSQL connection in [backend/src/config/env.ts](backend/src/config/env.ts) reads the `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME` environment variables, falling back to the historical hardcoded defaults (`postgres` / `12345678` / `localhost` / `5432` / `cooking_helper`) when unset. Env values are parsed with zod on startup, so invalid ports or logger levels fail fast with a clear configuration error. `JWT_SECRET_KEY` stays optional at startup (but must be at least 32 characters when set) and is still checked lazily by JWT code. [backend/src/db.ts](backend/src/db.ts) consumes that typed config.
2. Backend `.env` is gitignored. Copy [backend/.env.example](backend/.env.example) to `backend/.env` and fill it in. It holds `JWT_SECRET_KEY` (read lazily through [backend/src/config/env.ts](backend/src/config/env.ts) by JWT auth code) plus the `DB_*` keys, `NODE_ENV`, `PORT`, optional `LOG_LEVEL` for pino, `CORS_ORIGIN` (the allowed frontend origin), and `COOKIE_DOMAIN` (empty in dev for a host-only auth cookie; the shared parent domain in production so subdomains share the session - `Secure` flips on automatically when `NODE_ENV=production`). Without `JWT_SECRET_KEY`, login and every protected route return a 500 configuration error. Tests set a long `JWT_SECRET_KEY` in [backend/src/test/jest.setup.ts](backend/src/test/jest.setup.ts). When you add a new env key, add it (without a value) to `.env.example` too.
3. CORS in [backend/src/app.ts](backend/src/app.ts) allows the origin from the `CORS_ORIGIN` env var (default `http://localhost:8080`, via `config.corsOrigin`) and runs with `credentials: true`; the app mounts `cookie-parser` so the browser can send the httpOnly auth cookie cross-origin. For a different frontend port or a deployed origin, set `CORS_ORIGIN` in `.env` - no code change.
4. Database setup uses `node-pg-migrate` (configured to reuse the same `config.db` as the app, so there is no separate `DATABASE_URL`). On a fresh DB run `npm run migrate` (or `migrate up`) then `npm run seed` from the root or `backend/`. `seed` is idempotent (guards against existing rows), so it is safe to re-run. A DB that already has the schema from the legacy `database.sql` adopts the migrations without re-creating anything via `npm run migrate -- up --fake` (marks the initial migration as applied; data is untouched). New migrations are scaffolded with `npm --prefix backend run migrate:create <name>` (SQL files with `-- Up Migration` / `-- Down Migration` markers). The legacy `database.sql` has been removed - migrations are the only source of truth for the schema (its old content lives in git history if ever needed).

## Production deployment

**Live:** https://cooking-assistant.app

**Trigger:** push a `v*` tag (e.g. `v2.0`) - user does this, never Claude. GitHub Actions
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) then:

1. Builds `cooking-backend` Docker image via `tsup` + `node`, pushes to GHCR.
2. Builds `cooking-frontend` Docker image via Vite + nginx, pushes to GHCR.
3. Runs DB migrations + seed as an Azure Container Apps Job (`cooking-migration-job`).
4. Updates both Azure Container Apps with the new images.

**Infrastructure (Germany West Central):**

- Container Apps Environment: `cooking-assistant-env`
- Backend Container App: `cooking-backend`
- Frontend Container App: `cooking-frontend`
- Migration Job: `cooking-migration-job`
- DB: Neon PostgreSQL 16 (Frankfurt, free tier) - connection via `DB_*` env vars
- Images: `ghcr.io/pershynamilana/cooking-{backend,frontend}`
- SSL: Azure managed certificates on both custom domains

**Config at runtime** (Azure Container App env vars, never in repo): `JWT_SECRET_KEY`, `DB_*`,
`NODE_ENV`, `CORS_ORIGIN`, `COOKIE_DOMAIN`, `LOG_LEVEL`, `DB_SSL=true`.

**OIDC auth** (GitHub → Azure, no stored password): federated credential scoped to `refs/tags/v*`.
GitHub repo secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`.
GitHub repo variables: `AZURE_RG`, `BACKEND_APP`, `FRONTEND_APP`, `MIGRATION_JOB`, `API_DOMAIN`.

**Uptime monitoring (not wired up yet - manual step, no code involved):** point any free uptime
checker (e.g. UptimeRobot, Better Uptime, Freshping) at `GET https://api.cooking-assistant.app/api/health`
on a 1-5 minute interval, alerting on a non-200 response. It is the same public, unauthenticated
liveness endpoint `docker-compose`/Container Apps already probe - no new backend code needed, just
external configuration once an account exists on whichever provider is chosen.

**Cookie in prod**: `httpOnly`, `secure` (auto when `NODE_ENV=production`), `sameSite: Lax`,
`domain: .cooking-assistant.app` (leading dot so the app and api subdomains share the session).

**When adding env vars**: add to `.env.example`, set in Azure Container App configuration, never commit
values. Switching Postgres providers = change 5 `DB_*` env vars in the Container App, no code change.

## Database workflow

Three kinds of database change, and they are NOT the same thing - pick by what you are changing:

1. **Runtime data** (a user creates a recipe, adds a pantry ingredient, etc.) - just flows in through the normal API/repository `INSERT`s while the app runs. No migration, no seed, nothing to edit. This is the vast majority of writes.
2. **Seed / starter reference data** (the unit_measurement / recipe_types / menu_category rows and the sample ingredients that every fresh DB should start with) - lives in [backend/src/scripts/seed.ts](backend/src/scripts/seed.ts).
3. **Schema change** (a new table, column, constraint, or index - the _shape_ of the DB) - a new migration in [backend/migrations/](backend/migrations/).

**To add a new starter ingredient (e.g. a 23rd one):** add one row to the ingredients `VALUES` list in [backend/src/scripts/seed.ts](backend/src/scripts/seed.ts) (name, unit, allergens, days_to_expire, seasonality, storage_condition), then run `npm run seed`. Seed is idempotent (`ON CONFLICT (name) DO NOTHING`), so on an existing DB it inserts only the new row and leaves the other 22 alone. Commit the seed change. Do NOT write a migration for this - ingredients are rows, not schema.

**To make a schema change (the only time you write a migration):**

1. `npm --prefix backend run migrate:create <short-name>` - scaffolds `migrations/<timestamp>_<short-name>.sql` with empty `-- Up Migration` / `-- Down Migration` sections.
2. Fill in `Up` (the change, e.g. `ALTER TABLE ingredients ADD COLUMN calories INTEGER;`) and `Down` (the exact reverse, e.g. `ALTER TABLE ingredients DROP COLUMN calories;`).
3. `npm run migrate` - applies only the new file (already-run migrations are recorded in the `pgmigrations` table and skipped). `npm run migrate down` rolls back the last one via its `Down` section.
4. Update the code that uses the new shape (the relevant `Pg*Repository` SQL/types, and a zod schema if it is request input), then commit the migration file together with that code.

The timestamp prefix on a migration filename only sets apply order (later timestamp = runs later); never rename or reorder existing migration files once they have been applied anywhere.

**How it is wired (read before adding any DB feature):**

- Migrations are plain SQL files in [backend/migrations/](backend/migrations/), one file per change, using node-pg-migrate's `-- Up Migration` / `-- Down Migration` markers (the `migrate:create` script scaffolds them; `migration-file-language` is `sql`). node-pg-migrate records applied migrations in a `pgmigrations` table and skips them next run. No `pgm.*` JS DSL - keep migrations as raw SQL.
- The runner and seed are tsx scripts in [backend/src/scripts/](backend/src/scripts/) (`migrate.ts`, `seed.ts`), placed under `src/` so they are typechecked and linted (they are excluded from coverage by the `collectCoverageFrom` allowlist). `migrate.ts` calls node-pg-migrate's programmatic `runner({ databaseUrl: config.db, ... })` and parses `up`/`down`/`--fake` from `argv`; `seed.ts` opens its own short-lived `new Pool(config.db)`. Both reuse `config.db` from [backend/src/config/env.ts](backend/src/config/env.ts) - the same `DB_*` source as `db.ts`; there is deliberately NO separate `DATABASE_URL`. Both log through the pino `logger` (the global `no-console` rule applies) and set `process.exitCode = 1` on failure.
- The backend compiles with `module`/`moduleResolution: "NodeNext"` (files stay CommonJS because there is no `"type": "module"`), so packages that declare types through an `exports` map (like node-pg-migrate) resolve natively - the old `node-pg-migrate.d.ts` shim was removed in 3.3. Do not reintroduce type shims for `exports`-map packages.
- `seed.ts` must stay idempotent so re-running it never duplicates or errors: tables with a unique constraint use `INSERT ... ON CONFLICT (...) DO NOTHING` (e.g. `ingredients.name`); reference tables without one (`unit_measurement`, `recipe_types`, `menu_category`) use `INSERT ... SELECT ... WHERE NOT EXISTS`. Seed the sample ingredients with all columns in one statement, looking the unit id up by `unit_name` (a subquery/JOIN) - never id-based `UPDATE`s.
- The initial migration is the full current schema (not a replay of historical ALTERs). It intentionally cleaned up two bits of cruft from the old `database.sql` while keeping behaviour identical: the duplicate `menu_recipe.menu_id` foreign key became one `ON DELETE CASCADE`, and `ingredient_purchases.quantity` is `NOT NULL DEFAULT 0` directly. Keep the misspelled column name `quantity_person_ingradient` (it is the real column).
- Two setup paths: a fresh/empty DB runs `npm run migrate` + `npm run seed`; a DB that already had the schema from the old `database.sql` is adopted once with `npm run migrate -- up --fake` (marks the initial migration applied without running it - data untouched). All scripts work from the repo root or `backend/`.

## Architecture

### Backend - clean (layered) architecture

Express app creation in [backend/src/app.ts](backend/src/app.ts) mounts operational middleware first (`helmet`, `pino-http`, CORS, and the 100kb JSON body parser), then the public health check and six domain routers under `/api`; [backend/src/index.ts](backend/src/index.ts) only wires the real composition root into `createApp`, listens, and drains the HTTP server plus pg pool on `SIGTERM`/`SIGINT`:

- `health.routes` -> public `/health` liveness probe
- `user.routes` -> register, login, get users
- `recipe.routes` -> recipe CRUD, ingredient list, filters, stats
- `type.routes` -> recipe types (read-only list; CRUD removed in 1.40)
- `userIngredients.routes` -> per-user pantry + purchase history
- `menu.routes` -> menu CRUD + per-user filter
- `menuCategory.routes` -> menu category list, menus by category

The backend is organised in layers with dependencies pointing inward (Dependency Rule). Wiring is built once in [backend/src/composition-root.ts](backend/src/composition-root.ts): `buildControllers(deps)` is reusable for tests, and the default export uses the real Pg repositories/services.

- **Routes** ([backend/src/routes/](backend/src/routes/)) are factory functions `(controller) => router` for domain routes, plus controller-free infrastructure routes such as health. They map `METHOD /path` directly to a controller handler and (almost always) guard it with `authenticateToken`. The only public routes are `/health`, `/register`, `/login`, and `/logout`; register/login are guarded by `authLimiter` from [backend/src/middleware/rateLimit.ts](backend/src/middleware/rateLimit.ts). Express 5 forwards rejected promises from async handlers to the error middleware.
- **Controllers** ([backend/src/controller/](backend/src/controller/)) are thin HTTP adapters: classes whose handlers are arrow-function properties (so `this` is bound). A handler reads input from `req` (params/body/query/`req.user.id`), calls a use case, sends the response. No try/catch - errors propagate to the error middleware.
- **Validation** ([backend/src/application/validation/](backend/src/application/validation/)) - zod request schemas plus the shared `validate()` helper. Schemas describe request shape only: types, required scalars, formats, ranges, and array item shape. Domain invariants stay in entities, so each rule lives in one layer only.
- **Use cases** ([backend/src/application/use-cases/](backend/src/application/use-cases/)) - one class per operation with `async execute(...)`. They hold input validation + orchestration, throw domain errors, and depend on repository/service TypeScript `interface`s, never on `pg` or express. Service ports are in [backend/src/application/ports/](backend/src/application/ports/) (`PasswordHasher`, `TokenService`).
- **Domain** ([backend/src/domain/](backend/src/domain/)) - repository TypeScript `interface`s, entities, and error types in [backend/src/domain/errors/AppError.ts](backend/src/domain/errors/AppError.ts) (`AppError` carries an HTTP `status`; `NotFoundError`/`ValidationError`/`UnauthorizedError`).
  `Recipe` and `Menu` entities keep domain invariants such as non-empty ingredients/recipes and required menu category.
- **Infrastructure** ([backend/src/infrastructure/](backend/src/infrastructure/)) - concrete `pg` repositories under `persistence/pg/` (ALL SQL lives here) and security adapters under `security/` (`BcryptPasswordHasher`, `JwtTokenService`). Adapters `implements` the relevant interface and each repository takes the shared `pool` from [backend/src/db.ts](backend/src/db.ts) via its constructor.
- **Config and ambient types**: [backend/src/config/env.ts](backend/src/config/env.ts) is the single typed environment loader, and [backend/src/config/logger.ts](backend/src/config/logger.ts) is the shared pino logger (`LOG_LEVEL`, silent in tests). [backend/src/types/](backend/src/types/) is only for ambient `.d.ts` declarations such as `express.d.ts` and `env.d.ts`; regular DTO/domain types live beside their layer as normal `.ts` exports.

Errors: a use case `throw`s a domain error; Express 5 forwards the rejected promise to the single `errorHandler` ([backend/src/middleware/errorHandler.ts](backend/src/middleware/errorHandler.ts)), which logs through pino and replies `{ error: <message> }` with `err.status || 500`. Every error body is `{ error: ... }`, including auth middleware failures and the JSON 404 for unknown routes.

When adding a feature: add SQL to the relevant `Pg*Repository` (and its interface), add a zod schema in `application/validation/`, add a use case (which calls `validate(...)` then orchestrates), call it from a controller handler, and wire the new pieces in the composition root. Transactions (`BEGIN/COMMIT/ROLLBACK`) live inside a single repository method (see the menu/pantry repos).

Auth flow: auth is an httpOnly cookie (`authToken`), not a Bearer header. `POST /login` signs an HS256 JWT with payload `{ id }` and `expiresIn: "24h"` via [backend/src/infrastructure/security/JwtTokenService.ts](backend/src/infrastructure/security/JwtTokenService.ts), then sets it as a cookie (`res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)` from [backend/src/config/cookie.ts](backend/src/config/cookie.ts)) and responds `{ message: "Logged in" }` - the token is never in the body. [backend/src/middleware/jwtMiddleware.ts](backend/src/middleware/jwtMiddleware.ts) reads the token from `req.cookies[AUTH_COOKIE_NAME]` (401 if missing, 403 if invalid), verifies, and attaches `req.user`. `GET /me` returns the current `{ id }`; `POST /logout` (public) clears the cookie. The current user's id always comes from `req.user.id` via the `getUserId(req)` helper ([backend/src/controller/requestUser.ts](backend/src/controller/requestUser.ts)), never from the request body/params.

### Frontend - api layer, routing, auth

**Auth is an httpOnly cookie, not localStorage.** The client never reads or stores a token. The shared axios instance [frontend/src/api/client.ts](frontend/src/api/client.ts) is created with `withCredentials: true`, so the browser carries the `authToken` cookie automatically - there is no `Authorization` header anywhere. `PrivateRoute` ([frontend/src/components/layout/PrivateRoute/PrivateRoute.tsx](frontend/src/components/layout/PrivateRoute/PrivateRoute.tsx)) gates by calling `getMe()` (`GET /api/me`) on mount: 200 renders the route, 401/403 redirects to `/login`, other errors show a session error. The api client's single response interceptor (`handleAuthError`) also hard-redirects to `/login` on a 401/403 for any protected request (except `/api/me` and the public paths).

**All HTTP goes through the `api/` layer - never import `axios` in a page, hook, or component** (an `eslint-plugin-boundaries` rule blocks it). [frontend/src/api/](frontend/src/api/) holds the shared `client.ts`, `endpoints.ts` (the typed `API_ROUTES` map; parameterized routes are builders), `httpError.ts` (`getApiErrorMessage` - normalizes any error to a user string from the backend's `{ error }` body), `redirect.ts`, and one thin typed wrapper per domain (`recipesApi`, `menusApi`, `authApi`, etc.). Pages/hooks call those wrappers.

Routing is centralized in [frontend/src/App.tsx](frontend/src/App.tsx): every page is `React.lazy`-loaded (one chunk per page) under a single `<Suspense fallback={<PageSpinner/>}>`; private routes are a data-driven `PRIVATE_ROUTES` array nested under one `<Route element={<PrivateRoute/>}>`. All paths come from [frontend/src/constants/routes.ts](frontend/src/constants/routes.ts) (`ROUTES`, path builders, `PUBLIC_PATHS`).

State lives in custom hooks under [frontend/src/hooks/](frontend/src/hooks/) (50+, composed) and in a Redux Toolkit store under [frontend/src/redux/](frontend/src/redux/). The store is wired in [frontend/src/redux/store.ts](frontend/src/redux/store.ts) via a `setupStore` factory shared by the app and tests; typed hooks (`useAppDispatch`, `useAppSelector`) live in [frontend/src/redux/hooks.ts](frontend/src/redux/hooks.ts). Server data is cached with **RTK Query**: a single `baseApi` ([frontend/src/redux/services/baseApi.ts](frontend/src/redux/services/baseApi.ts)) built on a custom `axiosBaseQuery` that routes every request through the shared `apiClient` (never `fetch`, so the auth cookie + 401/403 interceptor still apply), with one injected endpoint file per domain under [frontend/src/redux/services/](frontend/src/redux/services/) (`recipesApi`, `menusApi`, `authApi`, ...) exporting `useGet*Query`/`use*Mutation` hooks; cache invalidation runs off `tagTypes` (a mutation invalidates the tags its queries provide, so lists refetch automatically). Data flow: page/hook → RTK Query hook (`redux/services`) → `axiosBaseQuery` → `api/client`. Client/UI state lives in slices under `redux/slices/<domain>Slice.ts` (`session`, the `ui` modal manager, `notifications` toasts); each slice's selectors always live in a separate `redux/selectors/<domain>Selectors.ts` - never inline in the slice or in components. For no-argument endpoints and empty mutation responses use `null`, not `void` (the strict lint config rejects `void` in call type-arguments). User-facing strings go through i18next ([frontend/src/i18n/](frontend/src/i18n/), one namespace per domain, `en` only) via `useTranslation`. Bare path aliases (`api/`, `hooks/`, `components/`, `pages/`, `types/`, `utils/`, `constants/`, `config/`, `i18n/`, `redux/`) - never `../` across folders.

Pages are organized by domain folder under [frontend/src/pages/](frontend/src/pages/) (`auth`, `recipes`, `user-recipes`, `menu`, `user-menu`, `recipe-types`, `person-ingredients`, `statistics`, `not-found`). Reusable UI lives in [frontend/src/components/](frontend/src/components/), grouped by domain plus `layout/` and `ui/`. The stats page renders its charts with `recharts` (lazy-loaded page chunk); PDF export was removed in 3.3.

### Database model highlights

Key tables and joins (see the initial migration [backend/migrations/1781185648364_initial-schema.sql](backend/migrations/1781185648364_initial-schema.sql) for the full schema):

- `person` (users) <-> `recipes` via `person_id`
- `recipes` <-> `ingredients` through `recipe_ingredients` (with `quantity_recipe_ingredients`)
- `recipes.type_id` -> `recipe_types`
- `person` <-> `ingredients` through `person_ingredients` (the pantry, with `quantity_person_ingradient` - note the misspelling, it's the actual column name) and `ingredient_purchases` (history)
- `menu` (per-user, with `category_id` -> `menu_category`) <-> `recipes` through `menu_recipe`
- `ingredients` carries `id_unit_measurement` -> `unit_measurement` plus metadata (`allergens`, `days_to_expire`, `seasonality`, `storage_condition`)

The "missing ingredients for a menu" feature works by joining `menu_recipe` -> `recipe_ingredients` -> `ingredients` and subtracting the user's `person_ingredients`.

## Conventions in this codebase

- **i18n is mandatory for every user-visible string in the frontend.** Never hardcode English (or any other language) text in components, hooks, or Redux middleware. In React components/hooks use `useTranslation("namespace")` → `t("key")`; in non-React code (Redux middleware, utilities) use `import i18next from "i18next"` → `i18next.t("key")`. Add all new strings to the appropriate JSON file under `frontend/src/i18n/locales/en/` (`common.json` for cross-cutting messages like toasts and generic errors; domain namespaces for domain-specific text). i18next is initialized synchronously, so `i18next.t()` is safe to call anywhere, including in module-level constants.

- **Hand-authored SVG icons are always their own React component, never an inline `<svg>` copy-pasted into a page/component.** This is only for custom marks that don't come from `lucide-react` (e.g. the Donburi brand mark) - Lucide icons are already components and are imported directly. Shared hand-authored icons live in `frontend/src/components/icons/`, one component per file, typed with a shared `{ size?: number; className?: string }` props shape, themed via `stroke="currentColor"` so they inherit the surrounding text color. If an icon has size-dependent detail tiers (see `components/icons/DonburiMark*.tsx` for the pattern), give each tier its own component rather than branching SVG path data inside one component.
- **Every icon must trace the exact `<path>`/`<rect>`/`<circle>` data from the design mockups (`orc/design/cooking-assistant-redesign/project/*.dc.html`), not an approximate stock `lucide-react` equivalent.** Before wiring an icon, find its concrete usage in the mockups (the same concept can appear in more than one screen - a concrete screen's rendering overrides the abstract "04 — Iconography" legend in `Design System.dc.html` if the two ever disagree) and copy its path data verbatim into a new component under `components/icons/`. Only reuse an existing `lucide-react` icon for a design concept when its path data is already an exact (or functionally identical, e.g. only trivial coordinate rounding) match - never because it merely "looks close enough."

- Comments are plain `//` with a single space and a lowercase first letter (acronyms / proper nouns like JWT, SQL, URL, Express keep their case, e.g. `// JWT login`). The old `//?` / `//!` prefixes were removed - don't reintroduce them.
- Backend source is TypeScript with ESM-style `import`/`export`, executed by `tsx` with CommonJS runtime semantics (`module: "CommonJS"` in [backend/tsconfig.json](backend/tsconfig.json)). Do not add new `require`/`module.exports` in backend source files; root tooling configs such as ESLint and Jest stay CommonJS `.js`.
- Backend layering rules (keep the style uniform):
    - In a controller, every injected use case is a field named `<operation>UseCase` (e.g. `this.createRecipeUseCase`), called from the matching arrow-function handler. Uniform naming, and it never clashes with a handler name.
    - Add a `domain/entities/` class only when it enforces an invariant. The write use case builds it through a named factory (`Recipe.forCreation(...)` / `Recipe.forUpdate(...)`) that throws a `ValidationError`, then passes the entity to the repository. Do NOT create empty data-holder entities, and do NOT route reads through entities (queries return repository rows as-is, so response shapes stay identical).
    - Validate request input with a zod schema in `application/validation/` (one `<area>.schemas.ts` per domain, shared field helpers in `common.schemas.ts`); the use case calls `validate(schema, input)` from [backend/src/application/validation/validate.ts](backend/src/application/validation/validate.ts) at the top of `execute()` before building any entity. Schemas cover request shape only (types, required scalars, formats, ranges, array item shape) - the entity factory keeps the domain invariant (e.g. non-empty ingredients), so each rule lives in exactly one layer and zod does NOT duplicate it. A failed `validate` throws `ValidationError` (400), so every bad input is `{ error }`.
    - One route path = exactly one handler. Don't register a second router on a path another router already owns - the later one is unreachable dead code (mount order is in `index.ts`).
    - All SQL lives in `infrastructure/persistence/pg/*` repositories that implement an interface from `domain/repositories/`; multi-step transactions (`BEGIN/COMMIT/ROLLBACK`) stay inside a single repository method.
    - Type placement follows the layer: use inline types for one file, co-located `<area>.types.ts` for shared DTO/filter shapes inside a folder, and exported entity/repository types from their own modules. Do not turn `backend/src/types/` into a general type bucket.
- Backend path aliases are configured in [backend/tsconfig.json](backend/tsconfig.json) via `paths` only (no `baseUrl` - it is deprecated in TypeScript 6): bare-form folder aliases `domain/*`, `application/*`, `infrastructure/*`, `controller/*`, `routes/*`, `middleware/*`, `config/*`, `constants/*`, `test/*`, plus singleton aliases `app` and `composition-root` for the two top-level modules. Do not introduce `../` imports under `backend/src/`; cross-folder imports use bare aliases, same-folder neighbors stay relative with `./`. `tsx` resolves `paths` at runtime, tsup/esbuild resolves them at build time, and Jest maps them via an explicit `moduleNameMapper` in [backend/jest.config.js](backend/jest.config.js) (no dynamic tsconfig read).
- The old frontend `person-ingradients` folder was corrected to `person-ingredients` and the dead `useAuth` hook was removed. The DB column `quantity_person_ingradient` keeps its misspelling on purpose (it is the real column name) and appears verbatim in API responses - do not "fix" it.
- `backend/package.json` pins tsup's nested esbuild via an `overrides` entry (tsup's own range allowed a vulnerable version - GHSA-g7r4-m6w7-qqqr). When bumping tsup, check whether its esbuild range is fixed and drop the override.
- Commit lockfiles and tool configs. `package-lock.json` (root/backend/frontend) and `eslint.config.js` are tracked - committing them keeps installs reproducible and lets CI run `npm ci`. (They used to be gitignored; that rule was removed.)
