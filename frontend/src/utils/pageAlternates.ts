import type { Metadata } from "next";

import type { Locale } from "constants/locales";
import { LOCALES } from "constants/locales";

import { localizePath } from "utils/localePath";

type Alternates = NonNullable<Metadata["alternates"]>;

// self-canonical per language, so search engines show each visitor theirs, not duplicates
export const pageAlternates = (path: string, locale: Locale): Alternates => ({
    canonical: localizePath(path, locale),
    languages: {
        ...Object.fromEntries(
            LOCALES.map((language) => [language, localizePath(path, language)]),
        ),
        "x-default": path,
    },
});
