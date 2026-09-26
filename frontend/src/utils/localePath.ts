import type { Locale } from "constants/locales";
import { DEFAULT_LOCALE, isLocale } from "constants/locales";

interface SplitPath {
    locale: Locale | null;
    path: string;
}

const SEGMENT_END = /[/?#]/;
const ROOT_PATH = /^\/(?:[?#]|$)/;

// the first path segment, and whatever follows it
const leadingSegment = (href: string): [string, string] => {
    if (!href.startsWith("/")) {
        return ["", href];
    }

    const length = href.slice(1).search(SEGMENT_END);
    const end = length === -1 ? href.length : length + 1;

    return [href.slice(1, end), href.slice(end)];
};

export const splitLocale = (href: string): SplitPath => {
    const [first, rest] = leadingSegment(href);

    if (!isLocale(first)) {
        return { locale: null, path: href };
    }

    return { locale: first, path: rest.startsWith("/") ? rest : `/${rest}` };
};

// the route a pathname addresses, whatever language it is shown in
export const stripLocale = (pathname: string): string =>
    splitLocale(pathname).path;

export const localeOfPath = (pathname: string): Locale =>
    splitLocale(pathname).locale ?? DEFAULT_LOCALE;

// the default language keeps the bare path, so every address that existed before stays valid; a path
// that already names its language is left as it is
export const localizePath = (href: string, locale: Locale): string => {
    const isAppPath = href.startsWith("/") && !href.startsWith("//");
    const isLocalizable =
        locale !== DEFAULT_LOCALE &&
        isAppPath &&
        splitLocale(href).locale === null;

    if (!isLocalizable) {
        return href;
    }

    return ROOT_PATH.test(href)
        ? `/${locale}${href.slice(1)}`
        : `/${locale}${href}`;
};

// the same page, query and all, in another language
export const switchLocaleHref = (
    { pathname, search, hash }: Pick<Location, "pathname" | "search" | "hash">,
    locale: Locale,
): string => localizePath(`${stripLocale(pathname)}${search}${hash}`, locale);
