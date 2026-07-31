# Cooking Assistant - Frontend

React 19 + TypeScript + Vite client for the [Cooking Assistant](../README.md) platform. It talks to the
[backend](../backend/README.md) API under `/api`. Authentication is a server-set **httpOnly cookie**, so
the client never sees or stores a token - it just sends requests with credentials and lets the browser
carry the cookie.

**Live:** https://cooking-assistant.app

## Tech stack

- **React 19 + TypeScript** - UI
- **Vite 8** - dev server, HMR, production bundler
- **React Router DOM v7** - a data router (`createBrowserRouter`), with `React.lazy` + `Suspense`
  code splitting (one chunk per page) and `useBlocker` support for unsaved-edit guards on forms
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
npm run dev          # vite dev server -> http://localhost:8080
npm run build        # tsc -b && vite build (the real type-check happens here)
npm run preview      # serve the production dist/
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run lint:sonarjs # SonarJS static-analysis ruleset
npm run stylelint    # stylelint src/**/*.{css,scss}
npm run typecheck    # tsc -b
npm run test         # jest
npm run test:coverage# jest --coverage (enforces the 80% threshold)
```

Type errors only surface at `npm run build` / `npm run typecheck` (`tsc -b`), not at `npm run dev`. Run
one of them before opening a PR.

## Production (Docker + nginx)

In production the frontend is a static bundle served by nginx. The [Dockerfile](Dockerfile) has two stages:

1. **builder** - sets `ARG VITE_API_URL` (baked into the Vite bundle at build time), runs `npm run build`,
   produces `dist/`.
2. **runner** - copies `dist/` into `nginx:alpine`, uses [nginx.conf](nginx.conf) which sets the SPA
   fallback (`try_files $uri $uri/ /index.html`) so React Router deep-links work, 1-year cache headers
   for content-hashed assets, and serves `public/robots.txt` as a real static file at that path.

`VITE_API_URL` is passed as a Docker build-arg from GitHub Actions (value: `https://api.cooking-assistant.app`).
Once baked in it cannot be changed at runtime - to point the bundle at a different API, rebuild the image.

## Environment

A frontend `.env` is optional - copy [.env.example](.env.example) only if you need to override the API
location.

```
# VITE_API_URL=<deployed API origin>
```

- **Dev:** leave `VITE_API_URL` unset. The base URL falls back to `""` ([src/config/env.ts](src/config/env.ts)),
  so requests go to `/api` on the same origin (`:8080`). The Vite dev server proxies `/api` to the backend
  (`VITE_DEV_PROXY_TARGET`, default `http://localhost:3000` - see [vite.config.ts](vite.config.ts)). Keeping
  requests same-origin is what lets the httpOnly auth cookie be first-party without TLS in dev.
- **Production:** set `VITE_API_URL` to the deployed API origin.

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
  (via `window.location.assign`, since it runs outside React Router - see [src/api/redirect.ts](src/api/redirect.ts)).
  `GET /api/me` and `POST /api/change-password` are exempt (`SKIP_REDIRECT_URLS` - a 401 on
  change-password means "wrong current password", not an expired session), and the public paths are
  exempt too.

## Source structure

```
src/
├── main.tsx        ReactDOM root (mounts <AppWrapper/>, imports i18n + global styles)
├── App.tsx         data router (createBrowserRouter) + Suspense + PrivateRoute layout route
│
├── api/            the ONLY place axios is touched
│   ├── client.ts      shared axios instance (withCredentials) + 401/403 interceptor
│   ├── endpoints.ts   API_ROUTES - typed map of every backend path (param routes are builders)
│   ├── httpError.ts   getApiErrorMessage/Code/Status/RetryAfter(err) - normalize any error
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
│   ├── ui/            SearchField, FilterPanel, ActiveFilterChips, Button, Chip, Select, ...
│   ├── icons/         hand-authored SVG icon components (design-mockup-traced)
│   ├── forms/         RecipeForm, MenuForm, auth forms, shared fields
│   └── recipes/, menu/, ingredients/, profile/, settings/, stats/, home/, cards/, modals/,
│       theme/, avatars/, connectivity/, auth/   domain-specific components
│
├── hooks/          all data fetching + stateful logic (50+ hooks, composed)
│
├── pages/          one folder per domain (route components, lazy-loaded)
│   ├── auth/                LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage,
│   │                        VerifyEmailPage
│   ├── home/                HomePage (dashboard at "/")
│   ├── recipes/             MainPage (all recipes), CreateRecipePage, RecipeDetailsPage,
│   │                        ChangeRecipePage
│   ├── user-recipes/        UserRecipesPage ("my recipes")
│   ├── person-ingredients/  IngredientsPage (the pantry)
│   ├── menu/                MenuPage, CreateMenuPage, MenuDetailsPage, ChangeMenuPage
│   ├── user-menu/           UserMenuPage ("my menus")
│   ├── statistics/          StatsPage (charts)
│   ├── profile/, settings/  ProfilePage, SettingsPage
│   └── not-found/           NotFoundPage (404)
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
  with the single response interceptor described above.
- **[endpoints.ts](src/api/endpoints.ts)** - `API_ROUTES`, a single typed source of truth for every path,
  grouped by domain; parameterized routes are builder functions, e.g. `API_ROUTES.recipes.byId(id)`.
- **[httpError.ts](src/api/httpError.ts)** - normalizes any axios error into a user-facing message, a
  stable error `code` (see the backend's `ERROR_CODES`), a `Retry-After` value, and an HTTP status.
- **`redux/services/baseApi.ts`** - the single RTK Query API slice; each domain file
  (`recipesApi.ts`, `menusApi.ts`, ...) injects its own `useGet*Query` / `use*Mutation` hooks off it.
  Cache invalidation runs off `tagTypes` - a mutation invalidates the tags its queries provide, so
  lists refetch automatically.

## Routing and code splitting

- [App.tsx](src/App.tsx) builds a data router (`createBrowserRouter`, not `<BrowserRouter>`) so forms
  can block in-app navigation away from unsaved edits via `useBlocker`. Every page is
  `React.lazy(() => import("pages/..."))`, wrapped in one `<Suspense fallback={<PageSpinner/>}>` inside
  the shared `RootLayout` (which also mounts the theme manager, modal root, offline modal, and toaster).
- Private routes are a data-driven `PRIVATE_ROUTES` array rendered as children of a single
  `<Route element={<PrivateRoute/>}>` layout route. Public routes (login, registration, forgot/reset
  password, verify email), and the `*` 404 sit outside the guard.
- All paths come from [src/constants/routes.ts](src/constants/routes.ts) (`ROUTES`, path builders like
  `recipeDetailsPath(id)`, and `PUBLIC_PATHS`).

### Routes

| Path                                                   | Page                                | Access  |
| ------------------------------------------------------ | ----------------------------------- | ------- |
| `/`                                                    | HomePage - dashboard                | private |
| `/login`, `/registration`                              | LoginPage, RegisterPage             | public  |
| `/forgot-password`, `/reset-password`, `/verify-email` | password reset / email verification | public  |
| `/all-recipes`                                         | MainPage - all recipes              | private |
| `/my-recipes`                                          | UserRecipesPage                     | private |
| `/add-recipe`, `/recipe/:id`, `/change-recipe/:id`     | Recipe create / details / edit      | private |
| `/all-menus`                                           | MenuPage                            | private |
| `/my-menus`                                            | UserMenuPage                        | private |
| `/add-menu`, `/menu/:id`, `/change-menu/:id`           | Menu create / details / edit        | private |
| `/ingredients`                                         | IngredientsPage (pantry)            | private |
| `/stats`                                               | StatsPage (charts)                  | private |
| `/profile`, `/settings`                                | ProfilePage, SettingsPage           | private |
| `*`                                                    | NotFoundPage                        | public  |

## State

Server data is cached with RTK Query (see above). Everything else - local UI state, one-off derived
values - lives in custom hooks under [src/hooks/](src/hooks/), composed from smaller hooks. Client/UI
state that needs to be shared across the tree (session, the modal manager, toasts, theme) lives in
Redux slices instead. Filtering/search on list pages goes through a shared declarative registry
(`utils/filters/`, `hooks/useListFilters.ts` for URL-backed lists, `hooks/useClientFilters.ts` for
local-state lists) rather than ad hoc component state.

## Internationalization

[src/i18n/index.ts](src/i18n/index.ts) initializes i18next with inlined JSON resources (synchronous,
`useSuspense: false`), `lng: "en"`, `defaultNS: "common"`. One namespace file per domain lives under
`src/i18n/locales/en/` (`common`, `auth`, `recipes`, `menu`, `ingredients`, `stats`, `profile`,
`settings`, `home`, `catalog`, `news`). Components/hooks read strings via `useTranslation("<namespace>")`;
non-React code (Redux middleware, utilities) uses `i18next.t()` directly. Every user-visible string must
go through i18n - no hardcoded English in components, hooks, or Redux middleware.

## Layering, ESLint boundaries, path aliases

- **Bare path aliases**, never `../` across folders: `api/`, `components/`, `hooks/`, `pages/`, `utils/`,
  `types/`, `constants/`, `config/`, `redux/`, `i18n/`, `assets/`, `styles/`, `test/` (defined in
  `tsconfig.app.json`, mirrored in `vite.config.ts` and `jest.config.cjs`).
- **`eslint-plugin-boundaries`** declares the layers and enforces (as errors): components may not import
  pages, and only the `api/` layer may import `axios`.
- Other guards: `simple-import-sort` (layer-aware order), `import/no-cycle`, `no-restricted-imports`
  banning `../`, a local rule requiring a named constant for any 3+ part logical condition, `max-lines`,
  and `complexity`.

## Testing

Jest 30 + `@swc/jest` + React Testing Library + jsdom. ~224 co-located `__tests__/` files across `api/`,
`redux/`, `hooks/`, `components/`, `pages/`, `utils/`, and `constants/`; `npm run test:coverage` enforces
an 80% global threshold (branches/functions/lines/statements).

Read [src/test/jest.setup.ts](src/test/jest.setup.ts) and [jest.config.cjs](jest.config.cjs) before
writing tests. Conventions:

- Co-located `__tests__/`, named `<Unit>.test.ts(x)`; `it("should ...")` names.
- Prefer `act` over `waitFor` (per the repo rule); render hooks with `renderHook`.
- Use `renderWithRouter` from [src/test/router.tsx](src/test/router.tsx) (defaults to a non-root route
  so tests aren't coupled to whatever page currently lives at `/`); assert navigation against the
  shared `mockNavigate`.
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
- New routes go in [src/constants/routes.ts](src/constants/routes.ts) and the `PRIVATE_ROUTES` array
  (or the public route list) in [App.tsx](src/App.tsx); add the page as a `React.lazy` import.
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
