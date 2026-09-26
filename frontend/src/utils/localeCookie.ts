import type { Locale } from "constants/locales";
import { isLocale, LOCALE_COOKIE_NAME } from "constants/locales";

const ONE_YEAR_SECONDS = 31_536_000;

// a choice the visitor made themselves; the proxy reads it to open an unprefixed link in that language
export const writeLocaleCookie = (locale: Locale): void => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
};

export const readLocaleCookie = (): Locale | null => {
    const prefix = `${LOCALE_COOKIE_NAME}=`;
    const value =
        document.cookie
            .split("; ")
            .find((entry) => entry.startsWith(prefix))
            ?.slice(prefix.length) ?? null;

    return value !== null && isLocale(value) ? value : null;
};
