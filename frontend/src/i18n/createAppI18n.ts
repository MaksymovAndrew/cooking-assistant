import type { i18n } from "i18next";
import i18next, { createInstance } from "i18next";

import { logger } from "config/logger";
import type { Locale } from "constants/locales";

import { i18nOptions } from "i18n/options";
import type { Resources } from "i18n/resources";

const isServer = typeof window === "undefined";

// requests in different languages render side by side on the server, so each gets an instance of its
// own. The browser serves one visitor and uses the global instance, which the store middleware and
// the error helpers translate through outside React
export const createAppI18n = (locale: Locale, resources: Resources): i18n => {
    if (isServer) {
        const instance = createInstance();

        instance.init(i18nOptions(locale, resources)).catch(logger.error);

        return instance;
    }

    if (!i18next.isInitialized) {
        i18next.init(i18nOptions(locale, resources)).catch(logger.error);

        return i18next;
    }

    Object.entries(resources).forEach(([namespace, bundle]) => {
        i18next.addResourceBundle(locale, namespace, bundle, true, true);
    });
    i18next.changeLanguage(locale).catch(logger.error);

    return i18next;
};
