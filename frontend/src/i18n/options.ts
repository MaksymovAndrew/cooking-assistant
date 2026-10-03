import type { InitOptions } from "i18next";

import type { Locale } from "constants/locales";

import type { Resources } from "i18n/resources";

export const DEFAULT_NAMESPACE = "common";

// inlined resources make init synchronous; "added" re-renders once the lazy catalog arrives
export const i18nOptions = (
    locale: Locale,
    resources: Resources,
    namespace: string = DEFAULT_NAMESPACE,
): InitOptions => ({
    // i18next writes later bundles into the object it is given; a copy keeps the shared one clean
    resources: { [locale]: { ...resources } },
    lng: locale,
    fallbackLng: false,
    defaultNS: namespace,
    interpolation: { escapeValue: false },
    react: { useSuspense: false, bindI18nStore: "added" },
});
