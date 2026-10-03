import type { Menu } from "types/menu";
import type { RecipeSearchResultItem } from "types/recipe";

// null when the server could not load it, so the browser loads it instead
export interface GuestLandingContent {
    recipes: RecipeSearchResultItem[] | null;
    menus: Menu[] | null;
}
