import type { i18n } from "i18next";

import type { Locale } from "constants/locales";
import { toLocale } from "constants/locales";

const CATALOG_NAMESPACE = "catalog";

// literal paths, so each language's catalog is its own chunk and only the one in use is fetched
const IMPORT_CATALOG: Record<Locale, () => Promise<object>> = {
    en: () =>
        import("i18n/locales/en/catalog.json").then((module) => module.default),
    pl: () =>
        import("i18n/locales/pl/catalog.json").then((module) => module.default),
    ru: () =>
        import("i18n/locales/ru/catalog.json").then((module) => module.default),
    uk: () =>
        import("i18n/locales/uk/catalog.json").then((module) => module.default),
};

const pending = new Map<Locale, Promise<object>>();

// shared while in flight or resolved; dropped on failure so a later call retries instead of
// reusing a rejected promise forever
const importCatalog = (locale: Locale): Promise<object> => {
    const existing = pending.get(locale);

    if (existing) {
        return existing;
    }

    const loading = IMPORT_CATALOG[locale]().catch((error: unknown) => {
        pending.delete(locale);

        throw error;
    });

    pending.set(locale, loading);

    return loading;
};

export const ensureCatalogLoaded = async (instance: i18n): Promise<void> => {
    const locale = toLocale(instance.language);

    if (instance.hasResourceBundle(locale, CATALOG_NAMESPACE)) {
        return;
    }

    const catalog = await importCatalog(locale);

    instance.addResourceBundle(locale, CATALOG_NAMESPACE, catalog);
};
