# Cooking Assistant

Full-stack app for running a home kitchen: track your pantry, write recipes, plan menus, and get a
shopping list of what you are missing. React + TypeScript on the front, Express + PostgreSQL on the back.

**Live:** https://cooking-assistant.app

## What it does

- Accounts with JWT auth carried in an httpOnly session cookie (24h tokens, bcrypt-hashed passwords)
- Recipes: create/edit/delete with ingredients, quantities, units, cooking time, servings
- Pantry: per-user inventory with quantities, purchase dates, expiry, allergens, seasonality
- Menus: bundle recipes by meal type; the app computes which ingredients you are missing
- Home dashboard: recipe/menu/pantry counts, ingredients expiring soon, recent recipes
- Stats: charts of your cooking patterns (Recharts)
- Filters: by type, ingredient, cooking time, or date
- Dark/light theme, follows your system preference by default

## Quick start

You need Node 22+, PostgreSQL 14+, and a Postgres client (pgAdmin / DBeaver / psql).

```bash
# 1. Clone
git clone <repository-url>
cd cooking-assistant

# 2. Database - create an EMPTY database (its name must match DB_NAME in backend/.env)
#    pgAdmin:  right-click Databases -> Create -> Database -> <your DB_NAME>
#    or psql:  psql -U <DB_USER> -c "CREATE DATABASE <DB_NAME>;"

# 3. Backend env
cp backend/.env.example backend/.env     # PowerShell: Copy-Item backend/.env.example backend/.env
#    fill in JWT_SECRET_KEY (and DB_* if your Postgres differs from the defaults)
#    generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Install (root postinstall installs backend + frontend too)
npm install

# 5. Build the schema and load starter data
npm run migrate     # create all tables (node-pg-migrate)
npm run seed        # load reference + sample data (idempotent)

# 6. Run both apps
npm start
```

Open http://localhost:8080, register, and you are in. `npm start` also serves on your local network,
so the same URL (with your machine's IP instead of `localhost`) works from a phone on the same Wi-Fi.

> **Already have a database from the old `database.sql` setup?** Don't run a plain `npm run migrate` on
> it (the tables already exist - it would error). Instead adopt the migrations once, without touching your data:
> `npm run migrate -- up --fake`. Full database guide (schema changes, seeding, rollbacks) is in
> [backend/README.md](backend/README.md).

## Layout

```
cooking-assistant/
├── package.json     orchestration scripts (concurrently)
├── CHANGELOG.md     single changelog for the whole project
├── CLAUDE.md        notes for AI tooling (also useful for humans)
├── e2e/             Playwright smoke suite (npm run test:e2e)
├── backend/         Express + PostgreSQL API on :3000  (see backend/README.md)
└── frontend/        React + Vite SPA on :8080          (see frontend/README.md)
```

It is a plain monorepo - no workspaces. The root `package.json` only holds `concurrently` and a few
scripts. See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for
per-app detail.

## Root scripts

```bash
npm install              # installs root + backend + frontend (postinstall hook)
npm start                # boot backend + frontend together (alias: npm run dev)
npm run start:backend    # backend only (tsx watch -> :3000)
npm run start:frontend   # frontend only (vite -> :8080)
npm test                 # run both Jest suites
npm run verify           # full local gate: format:check + lint + sonarjs + stylelint + typecheck + test + build
npm run test:e2e         # Playwright smoke suite against a live dev stack (needs both apps running)
npm run test:db          # backend repository tests against a real Postgres (needs Docker running)
npm run bump             # set the shared release version by hand (normally happens automatically on commit)
```

## Versioning and changelog

The whole project shares ONE version, kept in the root [package.json](package.json), and there is ONE
[CHANGELOG.md](CHANGELOG.md).

How to track it:

- Every release bumps the shared version by one (e.g. 1.3 -> 1.4).
- A release bumps `backend/package.json` and/or `frontend/package.json` up to the shared number, but
  only for the side(s) it actually changed. The untouched side keeps its old number. So a package
  version means "the last release this package changed in" and may skip numbers - it is a marker, not
  strict SemVer.
- [CHANGELOG.md](CHANGELOG.md) records each version with `### Backend` / `### Frontend` sections.

Workflow: branch from `main` as `release/X.Y`, make the change, add a changelog entry, commit, push,
open a PR for review. No git tags. The version bumps itself on commit (see `npm run bump` above) - no
manual step needed.

> We used to keep three independent versions and three changelogs with tag conventions. For a two-app
> project that was more overhead than value, so we consolidated to the single version + single
> changelog described above. See the note at the top of [CHANGELOG.md](CHANGELOG.md).

## Production deployment

Deployment is tag-triggered: push a `v*` tag and [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
builds both Docker images, pushes them to GHCR, runs DB migrations as an Azure Container Apps Job, then
updates the two Container Apps.

```bash
git tag v2.0
git push origin v2.0
```

Infrastructure: Azure Container Apps (Germany West Central, scale-to-zero), Neon PostgreSQL (Frankfurt),
GHCR for images, Azure managed certificates for HTTPS. Secrets and env vars live in the Container App
configuration - never in the repo.

## How we work (contributing)

- **Branch from `main`** named after the release (`release/X.Y`); never commit straight to `main` (a `pre-push` hook blocks it). Open a PR for review.
- **One commit = code change + version bump + changelog entry**, bundled together. Commit title: `<version>: <short description>` (e.g. `1.27: fix purchase-edit stock recalculation`).
- **PR description: short and to the point** - an `Added:` and/or `Fixed:` bullet list of what changed in user-facing terms. Omit a section if it has nothing. No "Checks" line, no git tags, no co-author trailer.
- **Quality gates must pass to merge:** CI runs a Prettier check plus, on both sides, ESLint, a `tsc` typecheck, a SonarJS lint, and Jest with coverage (80% gate); the frontend also runs a production build and Stylelint. Two more jobs run the slower suites on every PR: a Playwright e2e smoke test (real browser, live dev stack) and a backend repository suite against a real Postgres (Testcontainers). A `ci-success` job aggregates them all. The quick suite also runs locally on `pre-commit` (Husky + lint-staged), and `pre-push` blocks pushing to `main` and runs the frontend build. Reproduce the quick gate in one command with `npm run verify` (e2e/db-integration are separate - see `test:e2e`/`test:db` above). For pure ops-only commits (`.github/workflows/`, `.husky/`, docs) use `git skip-checks commit -m "..."` / `git skip-checks push origin <branch>` - a repo-local alias (auto-installed on `npm install`) that runs the command with `SKIP_CHECKS=1`. On commit it skips the local pre-commit hooks and auto-stamps `[skip-checks]` onto the commit subject so all CI jobs skip too (the required `ci-success` gate still passes); on push it also skips the frontend build. It is scoped to that one command, so a plain `git commit` afterwards runs the full checks. The direct-push-to-`main` block is never bypassed. In CI a `gate` job reads the head commit message (on a PR too), so `[skip-checks]` in the commit skips the jobs on both push and PR - no need to put it in the PR title.

## Tech stack

- Frontend: React 19, TypeScript, Vite 8, React Router v7, Redux Toolkit + RTK Query, Tailwind CSS + SCSS modules (migration to SCSS in progress), axios, i18next + react-i18next, Recharts; served by nginx in production
- Backend: Node.js, TypeScript, Express 5, `pg`, `node-pg-migrate`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `zod`, `helmet`, `pino`, `tsx` (dev) / `tsup` + `node` (prod)
- Database: PostgreSQL 16 (Neon managed, free tier)
- Infra: Docker multi-stage builds, GHCR, GitHub Actions, Azure Container Apps, Azure managed SSL
- Tests: Jest on both sides (backend ts-jest + Supertest, frontend @swc/jest + React Testing Library + jsdom, 80% coverage gate each) plus a Playwright e2e suite and a Testcontainers real-Postgres repository suite

Both sides have a Jest test suite with an 80% coverage gate: backend (`npm --prefix backend test`) uses ts-jest + Supertest with fake repositories; frontend (`npm --prefix frontend test`) uses @swc/jest + React Testing Library + jsdom (~150 test files). Run `npm test` from the root to run both. The e2e suite (`npm run test:e2e`) drives real login/CRUD flows through Chromium; the db-integration suite (`npm run test:db`) runs backend repositories against a real Postgres started by Testcontainers - Docker must be running locally for that one (GitHub-hosted CI runners already have Docker running, so nothing to configure there).

## License

MIT - see [LICENSE](LICENSE).
