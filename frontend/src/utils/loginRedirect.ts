import { AUTH_PATHS } from "constants/routes";

import { stripLocale } from "utils/localePath";

const STORAGE_KEY = "login-redirect";

// Next carries no router state, so the target is stashed instead of pushed. It is validated on
// read rather than trusted: a single leading slash can only ever address this app, never a host
const isInternalPath = (value: string): boolean =>
    value.startsWith("/") && !value.startsWith("//");

// reads the address bar rather than taking the path as an argument: every caller runs in an
// event handler or an effect, so subscribing to the current route just to record it would drag
// a Suspense boundary into the whole app shell
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
