import { ROUTES } from "constants/routes";

import { localeOfPath, localizePath } from "utils/localePath";

// hard navigation used from outside the Router (the axios auth interceptor)
export function redirectToLogin(): void {
    window.location.assign(
        localizePath(ROUTES.login, localeOfPath(window.location.pathname)),
    );
}
