import { createInstance } from "i18next";

import type { Locale } from "constants/locales";

import { ensureCatalogLoaded } from "i18n/loadCatalog";
import { DEFAULT_NAMESPACE, i18nOptions } from "i18n/options";
import { RESOURCES } from "i18n/resources";

// for code outside React (metadata, previews); an instance per call keeps requests' languages apart
export const getServerTranslation = async (
    locale: Locale,
    namespace: string = DEFAULT_NAMESPACE,
) => {
    const instance = createInstance();

    await instance.init(i18nOptions(locale, RESOURCES[locale], namespace));
    await ensureCatalogLoaded(instance);

    return instance.getFixedT(locale, namespace);
};
