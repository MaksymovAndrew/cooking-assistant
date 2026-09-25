import "server-only";

import type { Locale } from "constants/locales";

import auth from "i18n/locales/en/auth.json";
import calories from "i18n/locales/en/calories.json";
import common from "i18n/locales/en/common.json";
import dietPreferences from "i18n/locales/en/dietPreferences.json";
import guestLanding from "i18n/locales/en/guestLanding.json";
import home from "i18n/locales/en/home.json";
import ingredients from "i18n/locales/en/ingredients.json";
import menu from "i18n/locales/en/menu.json";
import news from "i18n/locales/en/news.json";
import profile from "i18n/locales/en/profile.json";
import recipes from "i18n/locales/en/recipes.json";
import settings from "i18n/locales/en/settings.json";
import shoppingList from "i18n/locales/en/shoppingList.json";
import stats from "i18n/locales/en/stats.json";
import tags from "i18n/locales/en/tags.json";

// the server holds every language; a page hands the browser only its own, so the bundle does not
// grow with each one added. "catalog" is loaded lazily instead, via loadCatalog.ts
const en = {
    common,
    recipes,
    menu,
    ingredients,
    stats,
    auth,
    home,
    guestLanding,
    news,
    profile,
    settings,
    calories,
    shoppingList,
    dietPreferences,
    tags,
};

export type Resources = typeof en;

// a language without its own copy yet is shown the default one
export const RESOURCES: Record<Locale, Resources> = {
    en,
    pl: en,
    ru: en,
    uk: en,
};
