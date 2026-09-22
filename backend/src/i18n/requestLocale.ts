import type { Request } from "express";

import {
    DEFAULT_LOCALE,
    isLocale,
    type Locale,
    LOCALES,
} from "constants/locales";

// the app sends the language it is showing (the account's choice once signed in) as Accept-Language
export function requestLocale(req: Pick<Request, "acceptsLanguages">): Locale {
    const match = req.acceptsLanguages(...LOCALES);

    return match && isLocale(match) ? match : DEFAULT_LOCALE;
}
