import type { Locale } from "constants/locales";
import { DEFAULT_LOCALE, isLocale } from "constants/locales";

import { localizePath, splitLocale } from "utils/localePath";

interface LocaleRequest {
    pathname: string;
    cookieLocale: string | null;
    acceptLanguage: string | null;
    isBot: boolean;
}

export type LocaleRoute =
    | { kind: "pass" }
    | { kind: "rewrite"; pathname: string }
    | { kind: "redirect"; pathname: string; permanent: boolean };

const QUALITY_PARAM = "q=";

interface WeightedLanguage {
    language: string;
    quality: number;
}

const parseEntry = (entry: string): WeightedLanguage => {
    const [tag = "", ...params] = entry.trim().split(";");
    const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith(QUALITY_PARAM));

    return {
        language: tag.split("-")[0].toLowerCase(),
        quality: quality ? Number(quality.slice(QUALITY_PARAM.length)) : 1,
    };
};

// the most preferred language the app has, by the browser's own ranking
export const negotiateLocale = (acceptLanguage: string | null): Locale | null =>
    (acceptLanguage ?? "")
        .split(",")
        .map(parseEntry)
        .filter(({ quality }) => quality > 0)
        .sort((a, b) => b.quality - a.quality)
        .map(({ language }) => language)
        .find(isLocale) ?? null;

// generated images are addressed by the route's own path, the default language's prefix included
const isMetadataImage = (path: string): boolean =>
    path.split("/").some((segment) => segment.startsWith("opengraph-image"));

// a crawler always gets the address it asked for: redirecting by its headers would hide the other languages
const preferredLocale = ({
    cookieLocale,
    acceptLanguage,
    isBot,
}: LocaleRequest): Locale | null => {
    if (isBot) {
        return null;
    }

    if (cookieLocale !== null && isLocale(cookieLocale)) {
        return cookieLocale;
    }

    return negotiateLocale(acceptLanguage);
};

export const resolveLocaleRoute = (request: LocaleRequest): LocaleRoute => {
    const { locale, path } = splitLocale(request.pathname);

    if (locale === DEFAULT_LOCALE) {
        return isMetadataImage(path)
            ? { kind: "pass" }
            : { kind: "redirect", pathname: path, permanent: true };
    }

    if (locale !== null) {
        return { kind: "pass" };
    }

    const preferred = preferredLocale(request);

    if (preferred !== null && preferred !== DEFAULT_LOCALE) {
        return {
            kind: "redirect",
            pathname: localizePath(request.pathname, preferred),
            permanent: false,
        };
    }

    return {
        kind: "rewrite",
        pathname: `/${DEFAULT_LOCALE}${request.pathname === "/" ? "" : request.pathname}`,
    };
};
