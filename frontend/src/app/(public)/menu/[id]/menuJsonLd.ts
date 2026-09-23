import { absoluteSiteUrl } from "config/site";
import { menuDetailsPath, recipeDetailsPath } from "constants/routes";
import type { MenuDetails } from "types/menu";

// schema.org/ItemList: the menu as an ordered list of recipe pages, each carrying its own Recipe
export const menuJsonLd = (
    { menu, recipes }: MenuDetails,
    description: string,
) => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: menu.title,
    description,
    url: absoluteSiteUrl(menuDetailsPath(menu.id)),
    numberOfItems: recipes.length,
    itemListElement: recipes.map((recipe, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteSiteUrl(recipeDetailsPath(recipe.recipe_id)),
        name: recipe.title,
    })),
});
