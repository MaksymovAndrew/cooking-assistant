import { DEFAULT_LOCALE, type Locale } from "constants/locales";

// the frontend serves the default language without a prefix and every other one under /<locale>
export function emailLink(
    frontendOrigin: string,
    path: string,
    token: string,
    locale: Locale,
): string {
    const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

    return `${frontendOrigin}${prefix}${path}?token=${token}`;
}
