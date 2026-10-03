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
- **i18next + react-i18next** - all user-facing strings (one namespace per domain; the page's language comes from the URL)
- **Recharts** - charts on the stats page (lazy-loaded)
- **lucide-react** + hand-authored SVG icon components (`src/components/icons/`) - iconography
- **Jest 30 + @swc/jest + React Testing Library + jsdom** - test suite (~390 co-located test files,
  80% coverage gate)

## Running locally

Prefer the repo root: `npm install && npm start` boots backend + frontend together. Use the commands
below only to work on the frontend alone.

```bash
npm install
npm run dev          # next dev -> http://localhost:8080
npm run build        # next build (type-checks as part of the build)
npm start            # next start - serve the production build
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
- **A password over 72 bytes** is refused by the registration, reset and change-password forms before
  it is sent (`isPasswordTooLong` in [src/utils/authValidation.ts](src/utils/authValidation.ts)): bcrypt
  reads only the first 72, so the server refuses it too. The limit is in UTF-8 bytes, not characters -
  a Cyrillic letter takes two.
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
├── proxy.ts        picks the page's language: passes /pl|ru|uk/..., sends /en/... to the bare
│                   path, serves a bare path in English or redirects it to the visitor's language
├── app/            the route tree - a route is one folder: page.tsx, page.module.scss, __tests__/
│   ├── [locale]/            every page, in every language
│   │   ├── layout.tsx           <html lang>/<body>, metadata, providers
│   │   ├── error.tsx            render error; not-found.tsx  unknown URL (real HTTP 404)
│   │   ├── [...missing]/        catches an address no route claims, so the 404 renders in the layout
│   │   ├── (auth)/              login, registration, forgot-password, reset-password, verify-email;
│   │   │                        each route's layout.tsx (AuthRouteLayout) carries the metadata its
│   │   │                        client page cannot export. AuthPage.module.scss is shared by the group
│   │   ├── (public)/            "/", all-recipes, all-menus, recipe/[id], menu/[id] - server
│   │   │                        components; each renders a client island beside it (*View.tsx)
│   │   └── (private)/           layout.tsx = PrivateRoute; my-recipes, my-menus, add-recipe,
│   │                            change-recipe/[id], add-menu, change-menu/[id], ingredients,
│   │                            shopping-list, stats, profile, settings. FormPage.module.scss is
│   │                            shared by the four form pages, like the auth one
│   ├── providers.tsx        store, the request's own i18n instance, navigation guard, #app-root
│   ├── global-error.tsx     stands in for the root layout when that crashes - own <html>, no providers
│   ├── manifest.ts          install manifest; icon.tsx (192/512) and apple-icon.tsx draw its icons
│   ├── sitemap.ts           public URLs only, each in every language and dated, walked from the API
│   │                        per request
│   ├── robots.ts            allow public, disallow the private prefixes and the emailed-link pages
│   │                        in every language
│   └── health/route.ts      the container's liveness probe
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
│   │                  RouteErrorBoundary, MobileSubpageHeader, ScrollToTopButton, SkipLink
│   ├── ui/            SearchField, FilterPanel, ActiveFilterChips, Button, Chip, Select, ProgressRing,
│   │                  AsyncContent, Breadcrumb, MoveButtons, ...
│   ├── icons/         hand-authored SVG icon components (design-mockup-traced)
│   ├── forms/         RecipeForm, MenuForm, EditRecordGate, auth forms, shared fields
│   └── recipes/, menu/, ingredients/, shopping-list/, profile/, settings/, stats/, home/, cards/, modals/,
│       theme/, avatars/, connectivity/, auth/   domain-specific components
│
├── hooks/          all data fetching + stateful logic (~100 hooks, composed)
│
├── constants/      routes.ts (ROUTES + path builders + PUBLIC_PATHS), pagination, theme, ...
├── config/         env.ts (API_BASE_URL), logger.ts (dev-only console wrapper)
├── i18n/           resources.ts (every language, server-only), createAppI18n.ts, server.ts,
│                   loadCatalog.ts + locales/<locale>/<namespace>.json
├── types/          shared TypeScript types (recipe, menu, ingredient, userIngredient, stats, auth, ...)
├── utils/          pure helpers (cookingTimeUtils, dateUtils, filters/ - the URL and
│                   client-side filter framework, ...)
├── styles/         the colour tokens, and SCSS abstracts (breakpoints, mixins, keyframes) shared by
│                   every module
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

- **The URL carries the language.** Every page lives under `app/[locale]/`. English is served
  without a prefix, so every address that existed before still works; Polish, Russian and Ukrainian
  live under `/pl`, `/ru` and `/uk`. [src/proxy.ts](src/proxy.ts) decides, through the pure
  [src/utils/localeRouting.ts](src/utils/localeRouting.ts): `/en/...` is a 308 to the bare path, and a
  bare path is served in English unless the `NEXT_LOCALE` cookie (a language the visitor chose) or
  else `Accept-Language` asks for another one - then it is a 307 to that prefix. Crawlers are never
  redirected. `Link` and `useAppRouter` put every path from `constants/routes.ts` into the page's
  language themselves, so a call site never writes a prefix; anything that compares against a route
  (the active nav item, the public-path check, the login redirect) reads `stripLocale(pathname)`.
- **Switching language is a full page load.** `LanguageSwitcher` (guest header, account menu, Settings,
  the sign-in pages) and the registration page's own select call `useSwitchLocale`, which writes the
  `NEXT_LOCALE` cookie, saves a signed-in account's language with `PUT /me/locale`, and loads the same
  address under the new prefix - the root layout and the resources change with it, so a client-side
  navigation would not do. After sign-in, `useFinishLogin` settles the device against the account: a
  cookie the visitor set wins and is saved to the account; without one, the account's language is used.
- **Recipes and menus carry their own language**, separate from the page's: the form picks it
  (`ContentLanguageSelect`, defaulting to the page's language), cards and detail pages show it as a
  `LanguageBadge`, the author's own text gets a matching `lang` attribute, and both lists filter by it
  through one shared descriptor (`utils/filters/contentLanguageFilter.ts`, URL key `lang`).
- Routes are the folder tree under [src/app/[locale]/](src/app/). Three route groups carry the map and never
  appear in a URL: `(auth)` for sign-in, `(public)` for anything a guest may read, and `(private)`,
  whose `layout.tsx` is a single `PrivateRoute` wrapper - **a page is private because of where it
  lives**, so it cannot forget its own guard. **`page.tsx` is the page**: the component, its
  stylesheet and its co-located `__tests__/` all live in the route folder, so a route is one place
  and nothing mirrors it.
- **The five public read pages render on the server.** `/`, both listings and both detail pages are
  server components: `page.tsx` fetches the data and renders it, and the interactive half sits beside
  it as a client island (`RecipeDetailsView`, `AllRecipesView`, ...) that receives what it needs as
  props instead of fetching it a second time. A shared recipe link therefore arrives with the recipe
  already in the HTML, and with metadata describing that recipe rather than the app. A guest's landing
  on `/` arrives with its recipes and menus as well: `(public)/loadGuestLanding.ts` loads them through
  `fetchAsVisitor`, and a section fetches in the browser only when its list is `null` - its request
  failed, or the API never answered the session check and the client-side `HomeRoute` gate decides.
- **The server's own requests go through [src/api/server.ts](src/api/server.ts)**, never a bare
  `fetch`. `fetchAsVisitor` forwards the visitor's session cookie - that one, not everything else the
  browser holds for this origin - plus `x-forwarded-for` and the page's language, and is always
  `no-store`, so a page built for one session can never be handed to another; `fetchPublic` carries no
  session and may be reused, which is what the sitemap uses. The cookie is forwarded, never parsed -
  the API stays the only place a token is verified. Both have a request deadline: a hung API would
  otherwise pile up renders until this container failed its own health check. Importing the module
  from a client component is a build error (`server-only`).
- **Metadata is a per-route fact.** Each public page has its own `generateMetadata`, and the two list
  pages point every filtered permutation back at one canonical URL. A record that does not exist
  answers a real HTTP 404. Two things make that work and neither is optional: `htmlLimitedBots: /.*/`
  in `next.config.ts`, so Next waits for `generateMetadata` rather than streaming it in afterwards,
  and the absence of a `loading.tsx` above the route. `pageAlternates(path, locale)` makes each language
  version its own canonical and lists the others as `hreflang` alternates (`x-default` is English).
  The sign-in pages are client components, so each `(auth)` route has a pass-through `layout.tsx`
  (`AuthRouteLayout`) that exports their metadata through `utils/authPageMetadata.ts`.
  `sitemap.ts` lists public URLs only, each in every language and with a `lastModified` from the
  record's `creation_date`; `robots.ts` derives its disallow list from `constants/routes.ts` for every
  language - the private prefixes plus `UNINDEXED_AUTH_PATHS`, the reset-password and verify-email
  pages an emailed link opens, which are also `noindex` themselves; the `(private)` layout carries one
  `noindex` for the group.
- **The app can be installed.** `app/manifest.ts` is one manifest for every language, its icons drawn
  by `app/icon.tsx` (192 and 512 px, at `/icon/<size>`) and `app/apple-icon.tsx`; the proxy's matcher
  skips both icon paths, since rewritten under a language they would 404. The viewport's `themeColor` is
  a light/dark `prefers-color-scheme` pair from the `--bg` tokens, and the pre-paint theme script points
  every `theme-color` meta at a stored theme choice.
- `layout.tsx` owns `<html>`/`<body>`, the metadata and the client providers; `error.tsx` and
  `not-found.tsx` cover a thrown render error and an unknown URL - the latter now answers with a real
  HTTP 404 instead of a 200 and an empty shell. `app/global-error.tsx` covers a crash of the root layout
  itself: it brings its own `<html>` and no providers, so its copy comes from the small `globalError`
  namespace, read straight from the JSON files rather than through an i18n instance. `loading.tsx`
  lives in the client-rendered groups (`(auth)`, `(private)`, both listings) and deliberately **not** at
  the root: it is the Suspense boundary those pages need to read search params, but a boundary above a
  server-rendered page flushes the response before that page has decided anything.
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
has to say so. The session is the first of them: the root layout reads whether the request carried the auth
cookie and seeds the store with `guest` when it did not, so a visitor who cannot be signed in gets the guest
navigation in the first byte instead of watching the signed-in one collapse after `/me` answers. With a
cookie the status stays `checking` and `/me` still decides. [src/hooks/useIsHydrated.ts](src/hooks/useIsHydrated.ts) is false for the server render
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

Every path above also exists under `/pl`, `/ru` and `/uk`; English is the bare path.

## State

Server data is cached with RTK Query (see above). Everything else - local UI state, one-off derived
values - lives in custom hooks under [src/hooks/](src/hooks/), composed from smaller hooks. Client/UI
state that needs to be shared across the tree (session, the modal manager, toasts, theme) lives in
Redux slices instead. Filtering/search on list pages goes through a shared declarative registry
(`utils/filters/`, `hooks/useListFilters.ts` for URL-backed lists, `hooks/useClientFilters.ts` for
local-state lists) rather than ad hoc component state. The menu form's recipe picker is a server search
instead: `useRecipePickerSearch` pages through `/recipes-by-filters` ("Show more recipes"), and the form
keeps the picked recipes as objects (`useSelectedRecipes`, `utils/menuFormRecipes.ts`), so nothing
downloads every recipe first.

A page never says "empty" while it is loading or has failed. `AsyncContent` shows a `ContentSkeleton`
while its data loads and an `ErrorState` with a retry when it fails, and `combineQueryStatus`
(`utils/queryStatus.ts`) folds several queries into one answer whose retry refetches only the failed
ones - the pantry, profile and settings pages are built on them. The edit pages go through
`EditRecordGate` (`resolveEditPageState` in `utils/editPageState.ts`): the form appears only for a
record that exists and is the viewer's own, and a 400, a 404 or someone else's record gets a "can't be
edited" state instead of an empty form.

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
  the queue in 4.2, and the form modals (add-ingredient, edit-profile, change-password,
  delete-account) followed in 5.0.
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
`<Name>ModalInput` interface in the `ModalInput` union (`ActiveModal` derives from it; an area's payloads
sit in `uiSlice.modals.pantry.ts`, `.cooking.ts` or `.account.ts`), a branch in one of `ModalRoot`'s
renderers, and a `dispatch(openModal(...))` at the trigger. `ModalRoot` hands a modal it does not render
itself down a chain - `ModalRoot.renderers.tsx`, then `.cooking.tsx`, then `.account.tsx`, whose
`renderAccountModal` is the last link - and each renderer lazy-loads its modals from a
`ModalRoot.lazy*.ts`, since `ModalRoot` is in every visitor's bundle.

**Toasts are a separate queue on purpose.** `notificationsSlice` is its own FIFO array where a repeated message replaces its
visible copy (so an error storm shows one toast, and a repeated confirmation shows again), and
`MAX_VISIBLE = 3` ([components/ui/Toasts/](src/components/ui/Toasts/)). Toasts are non-blocking and
several are visible at once; modals are blocking and strictly serialized. Don't merge the two. A toast
may carry an optional `link` (`{ href, label }`) to where the change landed - the shopping list uses it.
It may instead carry an `action`, a one-press follow-up such as "Undo" after "Cooked it": the
store keeps only plain data (`{ kind, consumptionId, label }`), the button dispatches
`runNotificationAction`, and `redux/middleware/notificationActions.ts` makes the request for that
`kind` - a kind without a runner there is a compile error. A toast with an action stays 10 seconds
instead of 4.

**A server-rendered page refreshes itself after a write it cannot see.** The menu page's missing
ingredients come from the server render, so there is no cache entry to invalidate when a toast's undo
puts products back. A write like that dispatches `markServerDataStale` (`serverDataSlice`), and a page
that mounts `useRefreshOnServerData` answers with `useAppRouter().refresh()` - a fresh server render that
keeps the client state. `refresh` skips the unsaved-changes guard: it navigates nowhere.

**"Cooked it"** takes a recipe's or menu's ingredients, times the portions, out of the pantry. The
pages hand `useCookedItHandler` the ingredients they already hold (`recipeCookRequirements` /
`menuCookRequirements` in `utils/cookPreview.ts`, a menu counting each recipe once like the server), and
`CookedItModal` previews against the pantry query - what is taken in full, what is used up, what is not
there and gets skipped. The calorie switch shows only when the record has calories.

## Internationalization

The page's language is the `[locale]` segment of its URL. [src/i18n/resources.ts](src/i18n/resources.ts)
holds every language's strings and is `server-only`; the root layout hands the browser only its own
language (`RESOURCES[locale]`), so adding a language does not grow anyone's bundle. `providers.tsx`
builds the i18n instance through [src/i18n/createAppI18n.ts](src/i18n/createAppI18n.ts): on the server a
fresh one per request, because requests in different languages render side by side and a shared one
would hand one visitor another's language; in the browser the global instance, initialized with that
same language. Init is synchronous (inlined resources, `useSuspense: false`), `defaultNS: "common"`.
One namespace file per domain lives under `src/i18n/locales/<locale>/`. `catalog` is split: its short
category and allergen lists travel with the page, while the 753 ingredient names are loaded lazily per
language by [src/i18n/loadCatalog.ts](src/i18n/loadCatalog.ts)'s `ensureCatalogLoaded(i18n)`, from an
effect in `AppShell`, so the auth pages never download them; `bindI18nStore: "added"` re-renders what
reads them once they land. The server's `getServerTranslation` always holds the whole catalog, and the
two server-rendered detail pages hand their island a record whose ingredient names are already in the
page's language (`utils/localizeIngredientNames.ts`), so the HTML a crawler reads is translated and the
browser shows the same text before and after the catalog arrives. i18next keeps the object it is given
and writes later bundles into it, which is why `i18nOptions` passes it a copy of the shared resources.

Components and hooks read strings with `useTranslation("<namespace>")` and the language with
`useLocale()`. Anything that renders never touches the global `i18next`: a helper that translates or
formats takes `t` or the locale as an argument (`resolveIngredientName(t, ingredient)`,
`formatKcal(value, locale)`, the date formatters, which go through the cached `Intl` formatters in
`utils/intlFormat.ts`). Only client code outside React - the Redux middleware toasts, `api/httpError.ts`,
the `Accept-Language` interceptor - uses the global instance, which in the browser is the page's.
Metadata and preview images use `getServerTranslation(locale, namespace)`. Every user-visible string
must go through i18n - no hardcoded English in components, hooks, or Redux middleware.

Recipe types, menu categories and units are rows the seed writes by their English name, and the seed also
matches rows on that name, so it is their key: [src/utils/referenceLabels.ts](src/utils/referenceLabels.ts)
(`recipeTypeName`, `menuCategoryName`, `unitName`) looks each one up under `common:recipeTypes`,
`menuCategories` and `units`, falling back to the stored name. Never print `type_name`, `category_name` or
`unit_name` directly. A unit printed next to an amount goes through `quantityWithUnit(t, locale, quantity,
unit)`, which writes the amount with the language's decimal separator (`formatQuantity`) and makes the
unit agree with it - "3 cloves", "3 зубчика", "5 ząbków" - while measures such as `g` or `ml` stay as they
are.

### Adding a string or a language

A new string goes into the English namespace file first, then into `pl`, `ru` and `uk` in the same change.
[src/i18n/\_\_tests\_\_/localeCompleteness.test.ts](src/i18n/__tests__/localeCompleteness.test.ts) fails if any
language lacks a key English has, lacks one of its own plural forms (`_one`/`_few`/`_many`/`_other` for
Polish, Russian and Ukrainian, read from `Intl.PluralRules`), drops a `{{placeholder}}`, leaves a string
empty or leaves it in English; `RESOURCES` is typed so a missing namespace does not compile. A new
language is one `LOCALES` entry in `constants/locales.ts` (the backend's copy must match - a backend test
compares them), a folder under `locales/`, and its entries in `resources.ts` and `loadCatalog.ts`.

### Translations

English is the source; the other languages are written, not transliterated from it. The rules every
language file follows:

- **Address.** Russian and Ukrainian use the polite «вы», lowercase; Polish uses the informal «ty», also
  lowercase in the interface (emails, being letters, capitalise «Ty»/«Ciebie»). Past-tense verbs that
  would reveal the reader's gender are avoided (Polish «zapisałeś») - the app does not know it.
- **Buttons** are short imperatives or infinitives as each language writes them: «Сохранить»,
  «Зберегти», «Zapisz». A button or chip should not run much longer than its English label; find a
  shorter word rather than letting it wrap.
- **Punctuation.** A dash is «—» with spaces, never a hyphen. Russian and Ukrainian quote with «ёлочки»,
  Polish with „…”. Russian always writes «ё»; Ukrainian uses the typographic apostrophe (’).
- **Vocabulary.** One word per concept across every namespace: Recipes - Рецепты / Рецепти / Przepisy;
  Menus - Меню / Меню / Jadłospisy; the pantry - Продукты / Продукти / Spiżarnia; Shopping list -
  Список покупок / Список покупок / Lista zakupów; Favourites - Избранное / Обране / Ulubione; Tags -
  Метки / Мітки / Tagi; what a person avoids - «не ем» / «не їм» / «nie jem». No bureaucratic calques
  («осуществить», «данный»), no word-for-word English.
- **Plurals** always come in every form the language has, even where two happen to be spelt the same.
- **Ingredient names** in the catalog are what a shop label says, capitalised, without stress marks or
  botanical names: «Спаржа», not «Холодок лікарський»; «Marchew», not «marchew uprawna». A backend test
  (`scripts/catalog/__tests__/catalogNames.test.ts`) rejects stress marks, lowercase starts, words mixing
  two alphabets and duplicate names.
- The brand name, "Cooking Assistant", is never translated.

## Accessibility

The shared components carry it, so a page built from them gets it - build on them, not around them:

- **Landmarks and headings.** `AppShell`, and `AuthLayout` on the sign-in pages, open with `SkipLink`,
  which focuses their `<main id={MAIN_CONTENT_ID}>` (`constants/landmarks.ts`); every `<nav>` has its
  own `aria-label`, and the header and tab-bar links mark the current page with `aria-current="page"`;
  a page has exactly one `h1` in every state, and a detail page's panels are `h2`.
- **Dialogs.** `BaseModal` needs a `title` or an `ariaLabel` to compile, portals to `<body>` and makes
  `#app-root` (the `display: contents` wrapper in `providers.tsx`) inert while open; `useDialogFocus`
  hands focus back to the opener, or to `#main` when the opener is gone.
- **Forms.** A field error is read with its field, not announced: a control inside `FormField` takes
  `aria-describedby`/`aria-invalid` from its context (`useFormFieldAria`), a hint goes through the
  `hint` prop, and `role="alert"` is for what no single field owns (`FormErrorBanner`, a list's "add at
  least one" error, a failed photo upload). `RecipeForm` and `MenuForm` focus the first invalid field
  after a failed submit (`useFocusFirstInvalid`).
- **Names.** Remove buttons, removable chips and move buttons name their item; a field without a label
  of its own is named after its item ("Quantity of {{name}}"); a pantry card is an `<article>` named by
  its ingredient; a number shown on its own, like the missing-ingredients badge on a menu page, has an
  accessible name that says what it counts.
- **Keyboard.** A draggable list also reorders with `MoveButtons` (`useDragReorder`, `MoveDirection` in
  `types/reorder.ts`), which keep focus on the moved item; a popover gives `usePopoverDismiss` its
  `triggerRef`, so Escape returns focus to the trigger; a `role="menu"` moves with the arrow, Home and
  End keys (`utils/menuKeyboard.ts`).
- **Colour.** `--brand-text` for brand-coloured text and icons (`--brand` is for fills, borders and
  focus rings), `--danger-fill` behind a solid danger button (`--danger` is for text); both themes meet
  WCAG AA contrast.

## Layering, ESLint boundaries, path aliases

- **Bare path aliases**, never `../` across folders: `api/`, `app/`, `components/`, `hooks/`, `utils/`,
  `types/`, `constants/`, `config/`, `redux/`, `i18n/`, `assets/`, `styles/`, `test/` (defined in
  `tsconfig.app.json`, mirrored in `jest.config.cjs` and the ESLint resolver).
- **`eslint-plugin-boundaries`** declares the layers and enforces (as errors): components may not import
  pages, and only the `api/` layer may import `axios`.
- Other guards: `simple-import-sort` (layer-aware order), `import/no-cycle`, `no-restricted-imports`
  banning `../`, a local rule requiring a named constant for any 3+ part logical condition, `max-lines`
  and `max-lines-per-function` (both 250, blank lines and comments not counted, tests exempt - a
  hard ceiling; the working norm is 100, see "File size and where code lives" in
  [AGENTS.md](../AGENTS.md)), and `complexity`.

## Testing

Jest 30 + `@swc/jest` + React Testing Library + jsdom. ~390 co-located `__tests__/` files across `app/`,
`api/`, `redux/`, `hooks/`, `components/`, `utils/`, and `i18n/`; `npm run test:coverage` enforces
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
- SCSS modules for styling, one per component; the colour tokens, breakpoints, mixins and keyframes live
  in `src/styles/` (a module `@include`s the keyframes it animates with, since CSS modules scope their
  names per file), and class names are joined with `cx()` from `utils/cx`. Stylelint guards CSS/SCSS.
- `"use client"` marks where a server component hands over to the client - a page, an island, a
  provider. Hooks never carry it: they only ever run inside a client component.
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
- [AGENTS.md](../AGENTS.md) - notes for AI coding agents
