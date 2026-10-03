import React from "react";

import { FAVOURITE_TARGET } from "constants/favourites";
import type { MenuDetailRecipe } from "types/menu";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { useFavouriteToggle } from "hooks/useFavouriteToggle";

import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";
import { MenuRecipesPanel } from "components/menu/MenuRecipesPanel";

import { aggregateMenuIngredients } from "utils/menuUtils";
import { filterAllergens } from "utils/recipeAllergens";

import { MenuDetailsActions } from "./MenuDetailsActions";
import styles from "./MenuDetailsView.module.scss";

interface MenuDetailsSecondaryProps {
    menuId: number;
    title: string;
    // null exactly when the server rendered this menu for an anonymous requester
    isFavourite: boolean | null;
    recipes: MenuDetailRecipe[];
    allergens: string[];
    isOwner: boolean;
    addRecipesTo: string;
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
    onCook?: () => void;
}

// DOM order is ingredients, actions, recipes everywhere; desktop only moves them via grid areas
export const MenuDetailsSecondary: React.FC<MenuDetailsSecondaryProps> = ({
    menuId,
    title,
    isFavourite,
    recipes,
    allergens,
    isOwner,
    addRecipesTo,
    editTo,
    onDelete,
    onLogIntake,
    onCook,
}) => {
    const { canUsePantry } = useAppSelector(selectViewerCapabilities);
    const favourite = useFavouriteToggle(
        FAVOURITE_TARGET.menu,
        menuId,
        isFavourite === true,
    );
    // the guest branch is decided from the server-rendered record, not the client session check
    const visitorFavourite = isFavourite === null ? null : favourite;
    const menuIngredients = aggregateMenuIngredients(recipes);
    const menuAllergens = filterAllergens(allergens);
    // a guest's allergen-free menu or an emptied menu has an empty aside, so no column is reserved
    const hasAsideContent = canUsePantry || menuAllergens.length > 0;
    const showIngredientsAside = recipes.length > 0 && hasAsideContent;
    const gridClassName = showIngredientsAside
        ? `${styles["menu-details-page__grid"]} ${styles["menu-details-page__grid--with-aside"]}`
        : styles["menu-details-page__grid"];

    return (
        <div className={gridClassName}>
            {showIngredientsAside && (
                <div className={styles["menu-details-page__ingredients-area"]}>
                    <MenuMissingIngredientsPanel
                        ingredients={menuIngredients}
                        allergens={menuAllergens}
                    />
                </div>
            )}
            <div className={styles["menu-details-page__actions-area"]}>
                <MenuDetailsActions
                    title={title}
                    isOwner={isOwner}
                    favourite={favourite}
                    visitorFavourite={visitorFavourite}
                    editTo={editTo}
                    onDelete={onDelete}
                    onLogIntake={onLogIntake}
                    onCook={onCook}
                />
            </div>
            <div className={styles["menu-details-page__recipes-area"]}>
                <MenuRecipesPanel
                    recipes={recipes}
                    isOwner={isOwner}
                    addRecipesTo={addRecipesTo}
                />
            </div>
        </div>
    );
};
