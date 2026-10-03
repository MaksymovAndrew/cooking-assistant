import type { Request } from "express";

import {
    DEFAULT_LOCALE,
    isLocale,
    type Locale,
    LOCALES,
} from "constants/locales";

// the frontend sends the language it shows as Accept-Language
export function requestLocale(req: Pick<Request, "acceptsLanguages">): Locale {
    const match = req.acceptsLanguages(...LOCALES);

    return match && isLocale(match) ? match : DEFAULT_LOCALE;
}
