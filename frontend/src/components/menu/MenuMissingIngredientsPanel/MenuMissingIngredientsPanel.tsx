import React from "react";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import type { AggregatedIngredient } from "utils/menuUtils";

import { MenuAllergens } from "./MenuAllergens";
import { MenuIngredientsTracking } from "./MenuIngredientsTracking";
import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuMissingIngredientsPanelProps {
    ingredients: Record<number, AggregatedIngredient>;
    allergens: string[];
}

export const MenuMissingIngredientsPanel: React.FC<
    MenuMissingIngredientsPanelProps
> = ({ ingredients, allergens }) => {
    const { canUsePantry } = useAppSelector(selectViewerCapabilities);

    if (!canUsePantry && allergens.length === 0) {
        return null;
    }

    return (
        <aside className={styles["menu-missing-ingredients-panel"]}>
            {canUsePantry && (
                <MenuIngredientsTracking ingredients={ingredients} />
            )}
            <MenuAllergens allergens={allergens} />
        </aside>
    );
};
