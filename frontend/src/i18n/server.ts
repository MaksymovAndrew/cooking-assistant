import { createInstance } from "i18next";

import type { Locale } from "constants/locales";

import { ensureCatalogLoaded } from "i18n/loadCatalog";
import { DEFAULT_NAMESPACE, i18nOptions } from "i18n/options";
import { RESOURCES } from "i18n/resources";

// metadata, structured data and preview images are generated outside the React tree, where useTranslation is
// unavailable. A fresh instance per call keeps one request's language out of another's, and it holds the whole
// ingredient catalog, which the browser only loads on demand
export const getServerTranslation = async (
    locale: Locale,
    namespace: string = DEFAULT_NAMESPACE,
) => {
    const instance = createInstance();

    await instance.init(i18nOptions(locale, RESOURCES[locale], namespace));
    await ensureCatalogLoaded(instance);

    return instance.getFixedT(locale, namespace);
};
