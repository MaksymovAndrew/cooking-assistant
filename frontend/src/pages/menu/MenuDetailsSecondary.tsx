import React from "react";

import type { MenuDetailRecipe } from "types/menu";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";
import { MenuRecipesPanel } from "components/menu/MenuRecipesPanel";

import { aggregateMenuIngredients } from "utils/menuUtils";
import { filterAllergens } from "utils/recipeAllergens";

import styles from "./MenuDetailsPage.module.scss";

interface MenuDetailsSecondaryProps {
    recipes: MenuDetailRecipe[];
    allergens: string[];
    isOwner: boolean;
    addRecipesTo: string;
}

// the recipes + missing-ingredients panels, split out of MenuDetailsPage to keep the page under the pages/ max-lines cap
export const MenuDetailsSecondary: React.FC<MenuDetailsSecondaryProps> = ({
    recipes,
    allergens,
    isOwner,
    addRecipesTo,
}) => {
    const { canUsePantry } = useAppSelector(selectViewerCapabilities);
    const menuIngredients = aggregateMenuIngredients(recipes);
    const menuAllergens = filterAllergens(allergens);
    // the aside is empty and unrendered for a guest with an allergen-free menu - see
    // MenuMissingIngredientsPanel's own early return - so the grid must not reserve its column
    const showIngredientsAside = canUsePantry || menuAllergens.length > 0;
    const gridClassName = showIngredientsAside
        ? `${styles["menu-details-page__grid"]} ${styles["menu-details-page__grid--with-aside"]}`
        : styles["menu-details-page__grid"];

    return (
        <div className={gridClassName}>
            <MenuRecipesPanel
                recipes={recipes}
                isOwner={isOwner}
                addRecipesTo={addRecipesTo}
            />
            <MenuMissingIngredientsPanel
                ingredients={menuIngredients}
                allergens={menuAllergens}
            />
        </div>
    );
};
