import { ROUTES } from "constants/routes";

import { localeOfPath, localizePath } from "utils/localePath";

// a hard navigation: the axios auth interceptor runs outside React
export function redirectToLogin(): void {
    window.location.assign(
        localizePath(ROUTES.login, localeOfPath(window.location.pathname)),
    );
}
