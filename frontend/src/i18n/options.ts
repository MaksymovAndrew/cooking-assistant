import type { InitOptions } from "i18next";

import type { Locale } from "constants/locales";

import type { Resources } from "i18n/resources";

export const DEFAULT_NAMESPACE = "common";

// resources are inlined, so init is synchronous and t() returns real strings at once; "added"
// re-renders a component when the lazily loaded catalog arrives
export const i18nOptions = (
    locale: Locale,
    resources: Resources,
    namespace: string = DEFAULT_NAMESPACE,
): InitOptions => ({
    resources: { [locale]: resources },
    lng: locale,
    fallbackLng: false,
    defaultNS: namespace,
    interpolation: { escapeValue: false },
    react: { useSuspense: false, bindI18nStore: "added" },
});
