import type { Location } from "react-router-dom";

// carried on router state only, never the URL - immune to open-redirect by construction, since
// it can only ever be a Location object this app itself produced, never freeform user input
export interface LoginRedirectState {
    from?: Location;
}

export const locationToPath = (location: Location): string =>
    `${location.pathname}${location.search}${location.hash}`;

// null/non-object state (e.g. a plain visit to /login) falls through to undefined
export const getLoginRedirectFrom = (state: unknown): Location | undefined => {
    if (!state || typeof state !== "object") {
        return undefined;
    }

    return (state as LoginRedirectState).from;
};
