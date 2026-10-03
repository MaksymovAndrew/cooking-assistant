import { DEFAULT_LOCALE, type Locale } from "constants/locales";

// mirrors the frontend's URLs: the default language carries no prefix
export function emailLink(
    frontendOrigin: string,
    path: string,
    token: string,
    locale: Locale,
): string {
    const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

    return `${frontendOrigin}${prefix}${path}?token=${token}`;
}
