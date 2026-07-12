import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { logger } from "config/logger";

import auth from "i18n/locales/en/auth.json";
import common from "i18n/locales/en/common.json";
import home from "i18n/locales/en/home.json";
import ingredients from "i18n/locales/en/ingredients.json";
import menu from "i18n/locales/en/menu.json";
import news from "i18n/locales/en/news.json";
import profile from "i18n/locales/en/profile.json";
import recipes from "i18n/locales/en/recipes.json";
import settings from "i18n/locales/en/settings.json";
import stats from "i18n/locales/en/stats.json";

// synchronous init (resources are inlined, no backend) so t() returns real strings immediately; useSuspense:false avoids a Suspense boundary in the app and tests
i18n.use(initReactI18next)
    .init({
        resources: {
            en: {
                common,
                recipes,
                menu,
                ingredients,
                stats,
                auth,
                home,
                news,
                profile,
                settings,
            },
        },
        lng: "en",
        fallbackLng: "en",
        defaultNS: "common",
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    })
    .catch(logger.error);

export default i18n;
