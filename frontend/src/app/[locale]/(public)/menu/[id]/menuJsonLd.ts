import { absoluteSiteUrl } from "config/site";
import type { Locale } from "constants/locales";
import { menuDetailsPath, recipeDetailsPath } from "constants/routes";
import type { MenuDetails } from "types/menu";

import { localizePath } from "utils/localePath";

// schema.org/ItemList: the menu as an ordered list of recipe pages, each carrying its own Recipe
export const menuJsonLd = (
    { menu, recipes }: MenuDetails,
    description: string,
    locale: Locale,
) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: menu.title,
    description,
    url: absoluteSiteUrl(localizePath(menuDetailsPath(menu.id), locale)),
    numberOfItems: recipes.length,
    itemListElement: recipes.map((recipe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteSiteUrl(
            localizePath(recipeDetailsPath(recipe.recipe_id), locale),
        ),
        name: recipe.title,
    })),
});
