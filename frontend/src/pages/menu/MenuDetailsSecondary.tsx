import React from "react";
import { useTranslation } from "react-i18next";

import type { MenuDetailRecipe } from "types/menu";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { MenuHeroVisitorActions } from "components/menu/MenuHero/MenuHeroVisitorActions";
import { MenuHeroActions } from "components/menu/MenuHeroActions";
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
    editTo: string;
    onDelete: () => void;
    onLogIntake?: () => void;
}

// ingredients -> actions -> recipes, in that DOM order everywhere - the reading order the page
// commits to. Desktop keeps ingredients as a right-side aside via grid-template-areas, which
// repositions items visually without changing this source order (see MenuDetailsPage.module.scss)
export const MenuDetailsSecondary: React.FC<MenuDetailsSecondaryProps> = ({
    recipes,
    allergens,
    isOwner,
    addRecipesTo,
    editTo,
    onDelete,
    onLogIntake,
}) => {
    const { t } = useTranslation("menu");
    const { canUsePantry, canFavourite } = useAppSelector(
        selectViewerCapabilities,
    );
    const menuIngredients = aggregateMenuIngredients(recipes);
    const menuAllergens = filterAllergens(allergens);
    // the aside is empty and unrendered for a guest with an allergen-free menu - see
    // MenuMissingIngredientsPanel's own early return - so the grid must not reserve its column
    const showIngredientsAside = canUsePantry || menuAllergens.length > 0;
    const gridClassName = showIngredientsAside
        ? `${styles["menu-details-page__grid"]} ${styles["menu-details-page__grid--with-aside"]}`
        : styles["menu-details-page__grid"];
    const favouriteLabel = t("menuDetailsPage.favourite");
    const logIntakeLabel = t("menuDetailsPage.logIntake");

    return (
        <div className={gridClassName}>
            <div className={styles["menu-details-page__ingredients-area"]}>
                <MenuMissingIngredientsPanel
                    ingredients={menuIngredients}
                    allergens={menuAllergens}
                />
            </div>
            <div className={styles["menu-details-page__actions-area"]}>
                {isOwner ? (
                    <MenuHeroActions
                        editTo={editTo}
                        onDelete={onDelete}
                        editLabel={t("menuDetailsPage.editButton")}
                        deleteLabel={t("menuDetailsPage.deleteButton")}
                        favouriteLabel={favouriteLabel}
                        onLogIntake={onLogIntake}
                        logIntakeLabel={logIntakeLabel}
                    />
                ) : (
                    <MenuHeroVisitorActions
                        canFavourite={canFavourite}
                        favouriteLabel={favouriteLabel}
                        logIntakeLabel={logIntakeLabel}
                        onLogIntake={onLogIntake}
                    />
                )}
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
