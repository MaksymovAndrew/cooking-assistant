import "server-only";

import type { Locale } from "constants/locales";

import enAuth from "i18n/locales/en/auth.json";
import enCalories from "i18n/locales/en/calories.json";
import enCatalog from "i18n/locales/en/catalog.json";
import enCommon from "i18n/locales/en/common.json";
import enDietPreferences from "i18n/locales/en/dietPreferences.json";
import enGuestLanding from "i18n/locales/en/guestLanding.json";
import enHome from "i18n/locales/en/home.json";
import enIngredients from "i18n/locales/en/ingredients.json";
import enMenu from "i18n/locales/en/menu.json";
import enNews from "i18n/locales/en/news.json";
import enProfile from "i18n/locales/en/profile.json";
import enRecipes from "i18n/locales/en/recipes.json";
import enSettings from "i18n/locales/en/settings.json";
import enShoppingList from "i18n/locales/en/shoppingList.json";
import enStats from "i18n/locales/en/stats.json";
import enTags from "i18n/locales/en/tags.json";
import plAuth from "i18n/locales/pl/auth.json";
import plCalories from "i18n/locales/pl/calories.json";
import plCatalog from "i18n/locales/pl/catalog.json";
import plCommon from "i18n/locales/pl/common.json";
import plDietPreferences from "i18n/locales/pl/dietPreferences.json";
import plGuestLanding from "i18n/locales/pl/guestLanding.json";
import plHome from "i18n/locales/pl/home.json";
import plIngredients from "i18n/locales/pl/ingredients.json";
import plMenu from "i18n/locales/pl/menu.json";
import plNews from "i18n/locales/pl/news.json";
import plProfile from "i18n/locales/pl/profile.json";
import plRecipes from "i18n/locales/pl/recipes.json";
import plSettings from "i18n/locales/pl/settings.json";
import plShoppingList from "i18n/locales/pl/shoppingList.json";
import plStats from "i18n/locales/pl/stats.json";
import plTags from "i18n/locales/pl/tags.json";
import ruAuth from "i18n/locales/ru/auth.json";
import ruCalories from "i18n/locales/ru/calories.json";
import ruCatalog from "i18n/locales/ru/catalog.json";
import ruCommon from "i18n/locales/ru/common.json";
import ruDietPreferences from "i18n/locales/ru/dietPreferences.json";
import ruGuestLanding from "i18n/locales/ru/guestLanding.json";
import ruHome from "i18n/locales/ru/home.json";
import ruIngredients from "i18n/locales/ru/ingredients.json";
import ruMenu from "i18n/locales/ru/menu.json";
import ruNews from "i18n/locales/ru/news.json";
import ruProfile from "i18n/locales/ru/profile.json";
import ruRecipes from "i18n/locales/ru/recipes.json";
import ruSettings from "i18n/locales/ru/settings.json";
import ruShoppingList from "i18n/locales/ru/shoppingList.json";
import ruStats from "i18n/locales/ru/stats.json";
import ruTags from "i18n/locales/ru/tags.json";
import ukAuth from "i18n/locales/uk/auth.json";
import ukCalories from "i18n/locales/uk/calories.json";
import ukCatalog from "i18n/locales/uk/catalog.json";
import ukCommon from "i18n/locales/uk/common.json";
import ukDietPreferences from "i18n/locales/uk/dietPreferences.json";
import ukGuestLanding from "i18n/locales/uk/guestLanding.json";
import ukHome from "i18n/locales/uk/home.json";
import ukIngredients from "i18n/locales/uk/ingredients.json";
import ukMenu from "i18n/locales/uk/menu.json";
import ukNews from "i18n/locales/uk/news.json";
import ukProfile from "i18n/locales/uk/profile.json";
import ukRecipes from "i18n/locales/uk/recipes.json";
import ukSettings from "i18n/locales/uk/settings.json";
import ukShoppingList from "i18n/locales/uk/shoppingList.json";
import ukStats from "i18n/locales/uk/stats.json";
import ukTags from "i18n/locales/uk/tags.json";

interface Catalog {
    category: Record<string, string>;
    allergen: Record<string, string>;
}

// the short category and allergen lists travel with the page; the 700-odd ingredient names are loaded on demand
// (loadCatalog.ts), and pages rendered on the server receive their records with those names already translated
const catalogLabels = ({ category, allergen }: Catalog): Catalog => ({
    category,
    allergen,
});

const en = {
    common: enCommon,
    recipes: enRecipes,
    menu: enMenu,
    ingredients: enIngredients,
    stats: enStats,
    auth: enAuth,
    home: enHome,
    guestLanding: enGuestLanding,
    news: enNews,
    profile: enProfile,
    settings: enSettings,
    calories: enCalories,
    shoppingList: enShoppingList,
    dietPreferences: enDietPreferences,
    tags: enTags,
    catalog: catalogLabels(enCatalog),
};

export type Resources = typeof en;

// the server holds every language; a page hands the browser only its own, so the bundle does not grow with each one.
// Typing each one as Resources makes a namespace missing from any language a compile error
export const RESOURCES: Record<Locale, Resources> = {
    en,
    pl: {
        common: plCommon,
        recipes: plRecipes,
        menu: plMenu,
        ingredients: plIngredients,
        stats: plStats,
        auth: plAuth,
        home: plHome,
        guestLanding: plGuestLanding,
        news: plNews,
        profile: plProfile,
        settings: plSettings,
        calories: plCalories,
        shoppingList: plShoppingList,
        dietPreferences: plDietPreferences,
        tags: plTags,
        catalog: catalogLabels(plCatalog),
    },
    ru: {
        common: ruCommon,
        recipes: ruRecipes,
        menu: ruMenu,
        ingredients: ruIngredients,
        stats: ruStats,
        auth: ruAuth,
        home: ruHome,
        guestLanding: ruGuestLanding,
        news: ruNews,
        profile: ruProfile,
        settings: ruSettings,
        calories: ruCalories,
        shoppingList: ruShoppingList,
        dietPreferences: ruDietPreferences,
        tags: ruTags,
        catalog: catalogLabels(ruCatalog),
    },
    uk: {
        common: ukCommon,
        recipes: ukRecipes,
        menu: ukMenu,
        ingredients: ukIngredients,
        stats: ukStats,
        auth: ukAuth,
        home: ukHome,
        guestLanding: ukGuestLanding,
        news: ukNews,
        profile: ukProfile,
        settings: ukSettings,
        calories: ukCalories,
        shoppingList: ukShoppingList,
        dietPreferences: ukDietPreferences,
        tags: ukTags,
        catalog: catalogLabels(ukCatalog),
    },
};
