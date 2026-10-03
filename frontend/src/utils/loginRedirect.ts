import { AUTH_PATHS } from "constants/routes";

import { stripLocale } from "utils/localePath";

const STORAGE_KEY = "login-redirect";

// stashed, as Next has no router state; a "//" start would address a host (open redirect)
const isInternalPath = (value: string): boolean =>
    value.startsWith("/") && !value.startsWith("//");

// reads window.location: subscribing to the route would drag a Suspense boundary into the app shell
export const rememberLoginRedirect = (): void => {
    const { pathname, search } = window.location;
    const path = `${pathname}${search}`;
    // recording a sign-in page would land the user back on the form they just came through
    const isWorthReturningTo =
        isInternalPath(path) && !AUTH_PATHS.includes(stripLocale(pathname));

    if (isWorthReturningTo) {
        window.sessionStorage.setItem(STORAGE_KEY, path);
    }
};

// one-shot: a stale target must never outlive the login it was recorded for
export const takeLoginRedirect = (): string | null => {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);

    window.sessionStorage.removeItem(STORAGE_KEY);

    return stored !== null && isInternalPath(stored) ? stored : null;
};
