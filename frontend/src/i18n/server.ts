import { createInstance } from "i18next";

import type { Locale } from "constants/locales";

import { DEFAULT_NAMESPACE, i18nOptions } from "i18n/options";
import { RESOURCES } from "i18n/resources";

// metadata and preview images are generated outside the React tree, where useTranslation is
// unavailable. A fresh instance per call keeps one request's language out of another's
export const getServerTranslation = async (
    locale: Locale,
    namespace: string = DEFAULT_NAMESPACE,
) => {
    const instance = createInstance();

    await instance.init(i18nOptions(locale, RESOURCES[locale], namespace));

    return instance.getFixedT(locale, namespace);
};
