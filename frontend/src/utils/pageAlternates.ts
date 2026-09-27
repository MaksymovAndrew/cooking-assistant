import type { Metadata } from "next";

import type { Locale } from "constants/locales";
import { LOCALES } from "constants/locales";

import { localizePath } from "utils/localePath";

type Alternates = NonNullable<Metadata["alternates"]>;

// each language version points at itself as canonical and lists the others, so search engines show a
// visitor the one in their language instead of treating the rest as duplicates
export const pageAlternates = (path: string, locale: Locale): Alternates => ({
    canonical: localizePath(path, locale),
    languages: {
        ...Object.fromEntries(
            LOCALES.map((language) => [language, localizePath(path, language)]),
        ),
        "x-default": path,
    },
});
