# Cooking Assistant - Frontend

React 19 + TypeScript + Next.js client for the [Cooking Assistant](../README.md) platform. It talks to the
[backend](../backend/README.md) API under `/api`. Authentication is a server-set **httpOnly cookie**, so
the client never sees or stores a token - it just sends requests with credentials and lets the browser
carry the cookie.

**Live:** https://cooking-assistant.app

## Tech stack

- **React 19 + TypeScript** - UI
- **Next.js 16 (App Router)** - dev server, bundler, routing and server rendering. Routes are the
  folder tree under `src/app/`; per-route code splitting comes with it
- **Redux Toolkit + RTK Query** - server-state caching. A single `baseApi` built on a custom
  `axiosBaseQuery` (routes every request through the shared `apiClient`, never `fetch`, so the auth
  cookie and 401/403 interceptor still apply), with one injected endpoint file per domain under
  `src/redux/services/`. Client/UI state (session, the modal manager, toasts, theme) lives in slices
  under `src/redux/slices/`
- **SCSS modules** - styling, one `.module.scss` per component; no Tailwind
- **axios** - HTTP client, wrapped behind a single shared instance in `src/api/`
- **i18next + react-i18next** - all user-facing strings (one namespace per domain, `en` locale today)
- **Recharts** - charts on the stats page (lazy-loaded)
- **lucide-react** + hand-authored SVG icon components (`src/components/icons/`) - iconography
- **Jest 30 + @swc/jest + React Testing Library + jsdom** - test suite (~224 co-located test files,
  80% coverage gate)

## Running locally

Prefer the repo root: `npm install && npm start` boots backend + frontend together. Use the commands
below only to work on the frontend alone.

```bash
npm install
npm run dev          # next dev -> http://localhost:8080
npm run build        # next build (type-checks as part of the build)
npm run preview      # next start - serve the production build
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run lint:sonarjs # SonarJS static-analysis ruleset
npm run stylelint    # stylelint src/**/*.{css,scss}
npm run typecheck    # tsc -b tsconfig.build.json
npm run test         # jest
npm run test:coverage# jest --coverage (enforces the 80% threshold)
```

Type errors only surface at `npm run build` / `npm run typecheck` (`tsc -b tsconfig.build.json`), not at `npm run dev`. Run
one of them before opening a PR.

## Production (Docker + Node)

In production the frontend is a Node process, not a pile of static files - it renders pages on
request. The [Dockerfile](Dockerfile) has two stages:

1. **builder** - takes `ARG NEXT_PUBLIC_API_URL` and `ARG NEXT_PUBLIC_SITE_URL` (Next inlines the
   first into the client bundle and resolves canonical/social URLs against the second, both at build
   time), runs `npm run build`.
2. **runner** - copies `.next/standalone` (the traced server plus only the `node_modules` it
   reaches), and then `.next/static` and `public/` **separately**: neither is part of the trace, and
   omitting them ships a site with no stylesheets and no icons. Runs `node server.js` as the
   unprivileged `node` user.

The server listens on **8080**, not 80 - an unprivileged user cannot bind a port below 1024, so the
reverse proxy targets that port ([../deploy/Caddyfile](../deploy/Caddyfile)).

`GET /health` ([src/app/health/route.ts](src/app/health/route.ts)) is the container liveness probe -
the one route handler in the app, and a deliberate exception to the rule that all HTTP goes through
the `api/` layer, which is about the product's own API. It has to be a route of its own: probing `/`
would run a full render, and a request to the backend, every fifteen seconds.

Both build-args are passed from GitHub Actions and baked in - pointing the image at a different API
or origin means rebuilding it, not restarting it.

**Server-rendered requests must forward the visitor's IP.** Every server-side call into the backend
has to pass `x-forwarded-for` through unchanged, so the backend's rate limiter keeps attributing the
request to the real visitor. Without it every rendered request arrives from the frontend container's
own address and the whole site looks like one very busy client to the limiter.

## Environment

A frontend `.env` is optional - copy [.env.example](.env.example) only if you need to override the API
location.

```
# NEXT_PUBLIC_API_URL=<deployed API origin>
# NEXT_PUBLIC_SITE_URL=<public origin of the site>
# API_INTERNAL_URL=<backend the dev server forwards /api to>
```

- **Dev:** leave `NEXT_PUBLIC_API_URL` unset. The base URL falls back to `""` ([src/config/env.ts](src/config/env.ts)),
  so requests go to `/api` on the same origin (`:8080`), and Next rewrites `/api` to the backend
  (`API_INTERNAL_URL`, default `http://localhost:3000` - see [next.config.ts](next.config.ts)). Keeping
  requests same-origin is what lets the httpOnly auth cookie be first-party without TLS in dev.
- **Production:** set `NEXT_PUBLIC_API_URL` to the deployed API origin, and `NEXT_PUBLIC_SITE_URL` to the
  site's own origin - a production build fails without it rather than ship canonical and social URLs
  pointing at localhost. Both are read at **build** time, so changing them needs a rebuilt image.

## Auth - read this before touching auth code

Auth is a **server-set httpOnly cookie** (`authToken`). The client cannot read it and stores nothing.

- The single shared axios instance ([src/api/client.ts](src/api/client.ts)) is created with
  `withCredentials: true`, so the browser sends/receives the cookie automatically. There is **no**
  `Authorization: Bearer` header and **no** `localStorage` token anywhere.
- **Login** (`useLoginForm` -> `useLoginMutation` in [src/redux/services/authApi.ts](src/redux/services/authApi.ts)) POSTs `/api/login`; the server
  sets the cookie and responds `{ message: "Logged in" }`. On a `429` (too many attempts) it reads
  `retry-after` and soft-locks the submit button until the window passes (escalating lockout, see
  `useLoginLockout`).
- **Logout** POSTs `/api/logout`; the server clears the cookie. Nothing to clean up client-side.
- **Password reset** (`/forgot-password` -> `/reset-password`) and **email verification**
  (`/verify-email`, plus in-app resend/confirm) reuse the same session-token machinery as short-lived,
  purpose-scoped links. Both flows are public routes (see `PUBLIC_PATHS` below).
- **Route gating** (`PrivateRoute`) is server-verified: on mount it fires `useGetMeQuery` (`GET /api/me`).
  While the check is pending it renders a blank screen; on `200` it renders the route; on `401/403` it
  redirects to `/login`; on any other error it shows a session-error message. It does **not** read
  `localStorage` and does **not** inspect a token.
- **401/403 handling** is centralized in the axios response interceptor (`handleAuthError` in
  [src/api/client.ts](src/api/client.ts)): a 401/403 on a protected request hard-redirects to `/login`
  (via `window.location.assign`, since it runs outside React - see [src/api/redirect.ts](src/api/redirect.ts)).
  `GET /api/me` and `POST /api/change-password` are exempt (`SKIP_REDIRECT_URLS` - a 401 on
  change-password means "wrong current password", not an expired session), and the public paths are
  exempt too.

## Source structure

```
src/
├── app/            the route tree - a route is one folder: page.tsx, page.module.scss, __tests__/
│   ├── layout.tsx           <html>/<body>, metadata, providers
│   ├── loading.tsx          the one Suspense boundary every route gets
│   ├── error.tsx            render error; not-found.tsx  unknown URL (real HTTP 404)
│   ├── (auth)/              login, registration, forgot-password, reset-password, verify-email
│   │                        AuthPage.module.scss is shared by the group
│   ├── (public)/            "/", all-recipes, all-menus, recipe/[id], menu/[id] - server
│   │                        components; each renders a client island beside it (*View.tsx)
│   ├── sitemap.ts           public URLs only, walked from the paginated API per request
│   ├── robots.ts            allow public, disallow the private prefixes, point at the sitemap
│   └── (private)/           layout.tsx = PrivateRoute; my-recipes, my-menus, add-recipe,
│                            change-recipe/[id], add-menu, change-menu/[id], ingredients,
│                            shopping-list, stats, profile, settings. The two form stylesheets are shared
│                            by the group, like the auth one
│
├── api/            the ONLY place axios is touched
│   ├── client.ts      shared axios instance (withCredentials) + 401/403 interceptor
│   ├── endpoints.ts   API_ROUTES - typed map of every backend path (param routes are builders)
│   ├── httpError.ts   getApiErrorMessage/Code/Status/RetryAfter(err) - normalize any error
│   ├── server.ts      the server render's own requests: fetchAsVisitor (forwards the cookie
│   │                  and x-forwarded-for, never cached) and fetchPublic (no session, cacheable)
│   └── redirect.ts    redirectToLogin() - hard navigation used by the interceptor
│
├── redux/          Redux Toolkit store
│   ├── store.ts       setupStore factory shared by the app and tests
│   ├── hooks.ts       typed useAppDispatch / useAppSelector
│   ├── services/      baseApi + axiosBaseQuery + one injected endpoint file per domain
│   │                  (recipesApi, menusApi, authApi, ingredientsApi, ...)
│   ├── slices/        client/UI state: session, ui (modal manager), notifications, theme,
│   │                  emailVerification
│   └── selectors/     one <domain>Selectors.ts per slice (never inline in components)
│
├── components/     reusable UI, grouped by domain (each is a folder + index.ts barrel)
│   ├── layout/        AppShell, AppHeader, MainNav, BottomNav, Logo, PrivateRoute, PageSpinner,
│   │                  RouteErrorBoundary, MobileSubpageHeader, ScrollToTopButton
│   ├── ui/            SearchField, FilterPanel, ActiveFilterChips, Button, Chip, Select, ProgressRing, ...
│   ├── icons/         hand-authored SVG icon components (design-mockup-traced)
│   ├── forms/         RecipeForm, MenuForm, auth forms, shared fields
│   └── recipes/, menu/, ingredients/, shopping-list/, profile/, settings/, stats/, home/, cards/, modals/,
│       theme/, avatars/, connectivity/, auth/   domain-specific components
│
├── hooks/          all data fetching + stateful logic (50+ hooks, composed)
│
├── constants/      routes.ts (ROUTES + path builders + PUBLIC_PATHS), pagination, theme, ...
├── config/         env.ts (API_BASE_URL), logger.ts (dev-only console wrapper)
├── i18n/           index.ts (i18next init) + locales/en/<namespace>.json
├── types/          shared TypeScript types (recipe, menu, ingredient, userIngredient, stats, auth, ...)
├── utils/          pure helpers (cookingTimeUtils, dateUtils, filters/ - the URL and
│                   client-side filter framework, ...)
├── styles/         SCSS abstracts (breakpoints, mixins) shared by every module
├── test/           Jest setup + shared test helpers (router, store, mocks, constants)
└── assets/         fonts (Kharkiv Tone, Montserrat)
```

## The api/ layer and RTK Query

Pages/hooks never import `axios` directly - the ESLint boundaries rule blocks it outside `src/api/`.
Data flow: page/hook -> RTK Query hook (`redux/services/*`) -> `axiosBaseQuery` -> `apiClient`.

- **[client.ts](src/api/client.ts)** - one `apiClient = axios.create({ baseURL, withCredentials: true })`
  with the single response interceptor described above, plus a request interceptor that sends the
  language the app is showing as `Accept-Language` - the server answers in it, and stores it on a new
  account for its emails.
- **[endpoints.ts](src/api/endpoints.ts)** - `API_ROUTES`, a single typed source of truth for every path,
  grouped by domain; parameterized routes are builder functions, e.g. `API_ROUTES.recipes.byId(id)`.
- **[httpError.ts](src/api/httpError.ts)** - normalizes any axios error into a user-facing message, a
  stable error `code` (see the backend's `ERROR_CODES`), a `Retry-After` value, and an HTTP status.
  The code is the contract and the wording is ours: a known code renders its copy from `apiErrors` in
  `i18n/locales/en/common.json` (keyed by code, e.g. `apiErrors.recipe/not_found`), and the server's
  English `error` text is only the fallback for a code this build doesn't know yet. A new backend error
  code needs its entry in [constants/errorCodes.ts](src/constants/errorCodes.ts) and its copy in
  `apiErrors` - a test on each side fails otherwise.
- **`redux/services/baseApi.ts`** - the single RTK Query API slice; each domain file
  (`recipesApi.ts`, `menusApi.ts`, ...) injects its own `useGet*Query` / `use*Mutation` hooks off it.
  Cache invalidation runs off `tagTypes` - a mutation invalidates the tags its queries provide, so
  lists refetch automatically.

## Routing

- Routes are the folder tree under [src/app/](src/app/). Three route groups carry the map and never
  appear in a URL: `(auth)` for sign-in, `(public)` for anything a guest may read, and `(private)`,
  whose `layout.tsx` is a single `PrivateRoute` wrapper - **a page is private because of where it
  lives**, so it cannot forget its own guard. **`page.tsx` is the page**: the component, its
  stylesheet and its co-located `__tests__/` all live in the route folder, so a route is one place
  and nothing mirrors it.
- **The five public read pages render on the server.** `/`, both listings and both detail pages are
  server components: `page.tsx` fetches the data and renders it, and the interactive half sits beside
  it as a client island (`RecipeDetailsView`, `AllRecipesView`, ...) that receives what it needs as
  props instead of fetching it a second time. A shared recipe link therefore arrives with the recipe
  already in the HTML, and with metadata describing that recipe rather than the app.
- **The server's own requests go through [src/api/server.ts](src/api/server.ts)**, never a bare
  `fetch`. `fetchAsVisitor` forwards the visitor's session cookie - that one, not everything else the
  browser holds for this origin - plus `x-forwarded-for`, and is always
  `no-store`, so a page built for one session can never be handed to another; `fetchPublic` carries no
  session and may be reused, which is what the sitemap uses. The cookie is forwarded, never parsed -
  the API stays the only place a token is verified. Both have a request deadline: a hung API would
  otherwise pile up renders until this container failed its own health check. Importing the module
  from a client component is a build error (`server-only`).
- **Metadata is a per-route fact.** Each public page has its own `generateMetadata`, and the two list
  pages point every filtered permutation back at one canonical URL. A record that does not exist
  answers a real HTTP 404. Two things make that work and neither is optional: `htmlLimitedBots: /.*/`
  in `next.config.ts`, so Next waits for `generateMetadata` rather than streaming it in afterwards,
  and the absence of a `loading.tsx` above the route. `sitemap.ts` lists public URLs only; `robots.ts` derives its
  disallow list from `constants/routes.ts`; the `(private)` layout carries one `noindex` for the group.
- `layout.tsx` owns `<html>`/`<body>`, the metadata and the client providers; `error.tsx` and
  `not-found.tsx` cover a thrown render error and an unknown URL - the latter now answers with a real
  HTTP 404 instead of a 200 and an empty shell. `loading.tsx` lives in the client-rendered groups
  (`(auth)`, `(private)`, both listings) and deliberately **not** at the root: it is the Suspense
  boundary those pages need to read search params, but a boundary above a server-rendered page
  flushes the response before that page has decided anything.
- All paths still come from [src/constants/routes.ts](src/constants/routes.ts) (`ROUTES`, builders like
  `recipeDetailsPath(id)`, and `PUBLIC_PATHS`, which feeds `matchRoutePattern` in the api layer). It is
  no longer the router's source of truth, but it is still the only place a path may be written.

### Navigation, and the unsaved-changes guard

Next has no router-level navigation blocker, so the app builds one and closes the ways around it:

- Links use `Link` from [src/components/ui/Link/](src/components/ui/Link/); programmatic navigation uses
  `useAppRouter` from [src/hooks/useAppRouter.ts](src/hooks/useAppRouter.ts). Importing `next/link`, or
  `useRouter` from `next/navigation`, is an **ESLint error** anywhere else - a bare `next/link` renders a
  perfectly working link with no guard at all, and nothing at the call site would show it.
- Both go through `NavigationBlockerProvider`
  ([src/components/layout/NavigationBlocker/](src/components/layout/NavigationBlocker/)). A form with
  unsaved edits registers a dirty ref via `useUnsavedChangesBlocker`; the provider then intercepts link
  clicks, programmatic pushes, tab close (`beforeunload`) and the back button. The back button needs a
  duplicate history entry, pushed while a guarded form is mounted, because a browser pop cannot be
  cancelled once it has happened.

### Hydration

A server-rendered page is on screen before React hydrates, so anything that would differ in that window
has to say so. [src/hooks/useIsHydrated.ts](src/hooks/useIsHydrated.ts) is false for the server render
and the first client render, true from the next one on: `useLoginLockout` uses it to read stored state
without a mismatch, and `Button` uses it to keep a `type="submit"` button disabled until hydration - a
submit landing earlier is a native browser submit that would put every field, passwords included, in the
URL.

### Routes

| Path                                                   | Page                                | Group     |
| ------------------------------------------------------ | ----------------------------------- | --------- |
| `/`                                                    | dashboard or guest landing          | (public)  |
| `/login`, `/registration`                              | LoginPage, RegisterPage             | (auth)    |
| `/forgot-password`, `/reset-password`, `/verify-email` | password reset / email verification | (auth)    |
| `/all-recipes`, `/recipe/:id`                          | MainPage, RecipeDetailsPage         | (public)  |
| `/all-menus`, `/menu/:id`                              | MenuPage, MenuDetailsPage           | (public)  |
| `/my-recipes`, `/my-menus`                             | UserRecipesPage, UserMenuPage       | (private) |
| `/add-recipe`, `/change-recipe/:id`                    | Recipe create / edit                | (private) |
| `/add-menu`, `/change-menu/:id`                        | Menu create / edit                  | (private) |
| `/ingredients`                                         | IngredientsPage (pantry)            | (private) |
| `/shopping-list`                                       | ShoppingListPage                    | (private) |
| `/stats`                                               | StatsPage (charts)                  | (private) |
| `/profile`, `/settings`                                | ProfilePage, SettingsPage           | (private) |
| anything else                                          | not-found.tsx (real HTTP 404)       | -         |

## State

Server data is cached with RTK Query (see above). Everything else - local UI state, one-off derived
values - lives in custom hooks under [src/hooks/](src/hooks/), composed from smaller hooks. Client/UI
state that needs to be shared across the tree (session, the modal manager, toasts, theme) lives in
Redux slices instead. Filtering/search on list pages goes through a shared declarative registry
(`utils/filters/`, `hooks/useListFilters.ts` for URL-backed lists, `hooks/useClientFilters.ts` for
local-state lists) rather than ad hoc component state.

## Modals - one queue, one renderer

Every modal in the app goes through a single FIFO queue in
[redux/slices/uiSlice.ts](src/redux/slices/uiSlice.ts) (`ui.queue`), and
[components/modals/ModalRoot/](src/components/modals/ModalRoot/) is the **only** place a modal is
rendered. `selectActiveModal` returns the head of the queue, so exactly one modal is ever on screen -
opening a second while one is showing makes it wait, never stack and never clobber the first. That
collision was real: two notice hooks could fire in the same tick and the second silently destroyed
the first, which had already marked itself "shown" and so never came back.

Rules that follow from this:

- **Never render a modal in place.** No page or component mounts its own modal - it dispatches
  `openModal({ type, ...payload })` and lets `ModalRoot` render it. `NewsModal` and `OfflineModal`
  used to be mounted directly and could therefore land on top of a queued modal; both were moved onto
  the queue in 4.2.
- **`openModal` ignores a type that is already queued.** A modal covers the screen, so a second one of
  the same type is always an accidental double dispatch (a double-clicked delete button), never a real
  second request. Same idea as notistack's `preventDuplicate`.
- **A modal closes itself** by dispatching `closeModal(modalId)`; the next queued modal is promoted
  automatically.
- **State-driven modals get a hook that owns the lifecycle**, not local component state - see
  [hooks/useOfflineNotice.ts](src/hooks/useOfflineNotice.ts), which enqueues on connectivity loss and
  withdraws on reconnect.
- **A "shown once" marker is written when the modal is actually presented**, not when it is enqueued -
  otherwise a notice still waiting its turn is recorded as seen and never returns
  (`useExpiredIngredientsNotice`, `useCalorieLimitNotice`).

Adding a modal is three edits and no change to the queue itself: a key in `MODAL_TYPE` plus its
`<Name>ModalInput`/`<Name>Modal` interfaces added to the `ModalInput`/`ActiveModal` unions, a branch in
`ModalRoot`, and a `dispatch(openModal(...))` at the trigger.

**Toasts are a separate queue on purpose.** `notificationsSlice` is its own FIFO array where a repeated message replaces its
visible copy (so an error storm shows one toast, and a repeated confirmation shows again), and
`MAX_VISIBLE = 3` ([components/ui/Toasts/](src/components/ui/Toasts/)). Toasts are non-blocking and
several are visible at once; modals are blocking and strictly serialized. Don't merge the two. A toast
may carry an optional `link` (`{ href, label }`) to where the change landed - the shopping list uses it.

## Internationalization

[src/i18n/index.ts](src/i18n/index.ts) initializes i18next with inlined JSON resources (synchronous,
`useSuspense: false`), `lng: "en"`, `defaultNS: "common"`. One namespace file per domain lives under
`src/i18n/locales/en/` (`common`, `auth`, `recipes`, `menu`, `ingredients`, `stats`, `profile`,
`settings`, `home`, `news`). `catalog` (the 739-item ingredient catalog, ~29.5 KB) is deliberately NOT
in that inlined set - [src/i18n/loadCatalog.ts](src/i18n/loadCatalog.ts)'s `ensureCatalogLoaded()` adds
it lazily via a dynamic `import()`, called once from `AppShell`'s module scope, so the public auth pages
(login, register, forgot/reset password, verify email) never download it. Components/hooks read strings
via `useTranslation("<namespace>")`; non-React code (Redux middleware, utilities) uses `i18next.t()`
directly. Every user-visible string must go through i18n - no hardcoded English in components, hooks, or
Redux middleware.

Units of measurement are the one exception: they are rendered straight from the record's `unit_name`
(`g`, `kg`, `ml`, `L`, `tsp`, `piece`, ...), the same short forms the `unit_measurement` table stores.
The catalog used to carry spelled-out names for them, and "250 milliliter" wrapped out of every tight
quantity row. Reach for a translation layer again only when a second language actually ships, and give
it short forms then too.

## Layering, ESLint boundaries, path aliases

- **Bare path aliases**, never `../` across folders: `api/`, `app/`, `components/`, `hooks/`, `utils/`,
  `types/`, `constants/`, `config/`, `redux/`, `i18n/`, `assets/`, `styles/`, `test/` (defined in
  `tsconfig.app.json`, mirrored in `jest.config.cjs` and the ESLint resolver).
- **`eslint-plugin-boundaries`** declares the layers and enforces (as errors): components may not import
  pages, and only the `api/` layer may import `axios`.
- Other guards: `simple-import-sort` (layer-aware order), `import/no-cycle`, `no-restricted-imports`
  banning `../`, a local rule requiring a named constant for any 3+ part logical condition, `max-lines`
  and `max-lines-per-function` (both 120, blank lines and comments not counted, tests exempt),
  and `complexity`.

## Testing

Jest 30 + `@swc/jest` + React Testing Library + jsdom. ~224 co-located `__tests__/` files across `api/`,
`redux/`, `hooks/`, `components/`, `utils/`, and `constants/`; `npm run test:coverage` enforces
an 80% global threshold (branches/functions/lines/statements).

Read [src/test/jest.setup.ts](src/test/jest.setup.ts) and [jest.config.cjs](jest.config.cjs) before
writing tests. Conventions:

- Co-located `__tests__/`, named `<Unit>.test.ts(x)`; `it("should ...")` names.
- Prefer `act` over `waitFor` (per the repo rule); render hooks with `renderHook`.
- Use `renderWithRouter` from [src/test/router.tsx](src/test/router.tsx) (defaults to a non-root route
  so tests aren't coupled to whatever page currently lives at `/`); assert navigation against the
  shared `mockNavigate`. `next/navigation` and `next/link` are mapped to
  [src/test/nextNavigationMock.ts](src/test/nextNavigationMock.ts), which holds a real, writable URL, so
  hooks built on search params are exercised rather than stubbed - seed it with `setTestLocation` /
  `setTestParams`. No test mocks the router itself.
- **Mocking**: both RTK Query service tests and component/page/hook tests `jest.mock("api/client")`
  and drive real RTK Query hooks through a real store (`makeTestStore`/`setupStore`), asserting
  against the typed mocks in [src/test/apiClientMock.ts](src/test/apiClientMock.ts)
  (`mockedGet`/`mockedPost`/...) - there's no separate per-domain wrapper to mock instead. `config/env`
  and `config/logger` are mocked globally through `moduleNameMapper`.
- No `as any` casts; real domain types from `types/*` for fixtures.

## Conventions

- Talk to the backend only through `redux/services/*` (RTK Query) or `src/api/*`; never import `axios`
  in a page, hook, or component.
- All user-facing copy goes through i18n (`useTranslation`), not string literals.
- SCSS modules for styling, one per component; shared breakpoints/mixins live in `src/styles/`.
  Stylelint guards CSS/SCSS.
- A new route is a folder under `src/app/` in the group matching its access, holding the page as
  `page.tsx` (plus `page.module.scss` and `__tests__/page.test.tsx` beside it); add its path to
  [src/constants/routes.ts](src/constants/routes.ts) as well.
- Hand-authored SVG icons (not from `lucide-react`) live in `src/components/icons/`, one component per
  file, path data traced verbatim from the design mockups.

## Known oddities (not bugs to fix in unrelated changes)

- The backend DB column `quantity_person_ingradient` (missing letters) keeps its misspelling - it is the
  real column name and appears verbatim in API responses. The frontend pantry **folder** was corrected to
  `person-ingredients` (the matching DB column stays misspelled).

## Versioning

The whole project shares one version and one changelog at the repo root. This package's version in
[package.json](package.json) marks the last release in which the frontend changed. See the
[root README](../README.md#versioning-and-changelog) and [root CHANGELOG.md](../CHANGELOG.md).

## Related

- [Root README](../README.md) - project overview and monorepo scripts
- [Backend README](../backend/README.md) - API server
- [CHANGELOG.md](../CHANGELOG.md) - project changelog
- [CLAUDE.md](../CLAUDE.md) - notes for AI tooling
